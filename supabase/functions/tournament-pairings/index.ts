import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // 1. Handle CORS Pre-flight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const debugLog: string[] = []
  const log = (msg: string) => {
    console.log(msg)
    debugLog.push(msg)
  }

  try {
    log('[DEBUG] Edge function started')

    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Parse the request body
    const { tournament_id, action, access_token } = await req.json()
    log(`[DEBUG] Request: tournament_id=${tournament_id}, action=${action}`)

    // 3. Verify Authorization
    let token = access_token
    if (!token) {
      const authHeader = req.headers.get('authorization')
      if (authHeader) {
        token = authHeader.replace('Bearer ', '')
      }
    }

    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing access token', debug: debugLog }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    log('[DEBUG] Verifying token...')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      log(`[ERROR] Token verification failed: ${userError?.message}`)
      return new Response(JSON.stringify({ error: 'Invalid or expired token', debug: debugLog }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    log(`[DEBUG] Token verified for user: ${user.email}`)

    // 4. Initialize Client for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (action === 'GENERATE_SEEDS') {
      log('[DEBUG] Action: GENERATE_SEEDS')

      // Fetch players
      const { data: rawPlayers, error: pError } = await supabase
        .from('participants')
        .select('*')
        .eq('tournament_id', tournament_id)

      if (pError || !rawPlayers) throw new Error("Failed to fetch participants")

      // Auto-Seed: Rating High -> Low
      const players = rawPlayers.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
        .map((p, index) => ({
          ...p,
          seed: index + 1
        }))

      // Check if there are any players to seed
      if (players.length === 0) throw new Error("No players found to seed.");

      // Save
      const { error: seedError } = await supabase.from('participants').upsert(players)
      if (seedError) throw seedError

      log('[DEBUG] Seeds generated and saved.')
      return new Response(JSON.stringify({ message: 'Seeds generated', debug: debugLog }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } else if (action === 'START') {
      log('[DEBUG] Action: START - Creating Round 1 matches')

      // Fetch participants ORDERED BY SEED
      const { data: players, error: pError } = await supabase
        .from('participants')
        .select('*')
        .eq('tournament_id', tournament_id)
        .order('seed', { ascending: true }) // CRITICAL: Pairing depends on this order

      if (pError) {
        log(`[ERROR] Failed to fetch participants: ${pError.message}`)
        throw new Error(`Could not fetch participants: ${pError.message}`)
      }

      log(`[DEBUG] Found ${players?.length || 0} participants for tournament_id=${tournament_id}`)

      if (!players || players.length === 0) {
        throw new Error(`No participants found for tournament_id=${tournament_id}`)
      }

      const n = players.length
      const bracketSize = Math.pow(2, Math.ceil(Math.log2(n)))
      log(`[DEBUG] n=${n}, bracketSize=${bracketSize}, creating ${bracketSize / 2} matches`)



      // Standard Tournament Seeding Sequence Logic
      const getSeedingOrder = (size: number): number[] => {
        let order = [1, 2]
        while (order.length < size) {
          let nextOrder = []
          for (let i = 0; i < order.length; i++) {
            nextOrder.push(order[i])
            nextOrder.push(2 * order.length + 1 - order[i])
          }
          order = nextOrder
        }
        return order
      }

      const seedOrder = getSeedingOrder(bracketSize)
      const matches = []

      // Pair according to the sequence (1v16, 8v9, 4v13, 5v12...)
      for (let i = 0; i < bracketSize; i += 2) {
        const s1 = seedOrder[i]
        const s2 = seedOrder[i + 1]

        const p1 = players.find(p => p.seed === s1)
        const p2 = players.find(p => p.seed === s2)

        matches.push({
          tournament_id,
          round: 1, // Store as INTEGER
          round_number: 1,
          board: (i / 2) + 1,
          player1_roll_no: p1?.roll_no || null,
          player2_roll_no: p2?.roll_no || null,
          result: !p2 ? 'Player 1 wins' : (!p1 ? 'Player 2 wins' : null),
          score: (!p1 || !p2) ? '1-0 (Bye)' : '0-0'
        })
      }

      log(`[DEBUG] Inserting ${matches.length} matches...`)
      log(`[DEBUG] First match: ${JSON.stringify(matches[0])}`)

      const { data: insertData, error: insertError } = await supabase.from('matches').insert(matches).select()

      if (insertError) {
        log(`[ERROR] Insert failed: ${insertError.message}`)
        throw new Error(`Failed to insert matches: ${insertError.message}`)
      }

      log(`[DEBUG] Successfully inserted ${insertData?.length || 0} matches`)

    } else if (action === 'READY_FOR_NEXT') {
      log('[DEBUG] Action: READY_FOR_NEXT - Creating next round matches')

      const { data: currentMatches, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournament_id)
        .order('round_number', { ascending: false })

      if (matchError) {
        log(`[ERROR] Failed to fetch matches: ${matchError.message}`)
        throw new Error(`Could not fetch matches: ${matchError.message}`)
      }

      log(`[DEBUG] Found ${currentMatches?.length || 0} existing matches`)

      if (!currentMatches || currentMatches.length === 0) {
        throw new Error('No matches found - cannot generate next round')
      }

      const maxRound = currentMatches[0].round_number
      log(`[DEBUG] Current max round: ${maxRound}`)

      const winners = currentMatches
        .filter(m => m.round_number === maxRound)
        .sort((a, b) => a.board - b.board)
        .map(m => m.result === 'Player 1 wins' ? m.player1_roll_no : m.player2_roll_no)

      log(`[DEBUG] Winners from round ${maxRound}: ${JSON.stringify(winners)}`)

      // If only 1 winner, tournament is over
      if (winners.length <= 1) {
        throw new Error('Tournament finish condition reached. Cannot generate next round.')
      }

      const nextMatches = []
      const nextNum = maxRound + 1

      for (let i = 0; i < winners.length; i += 2) {
        nextMatches.push({
          tournament_id,
          round: nextNum, // Store as INTEGER
          round_number: nextNum,
          board: (i / 2) + 1,
          player1_roll_no: winners[i],
          player2_roll_no: winners[i + 1] || null,
          result: winners[i] && !winners[i + 1] ? 'Player 1 wins' : null,
          score: winners[i] && !winners[i + 1] ? '1-0 (Bye)' : '0-0'
        })
      }

      log(`[DEBUG] Inserting ${nextMatches.length} matches for Round ${nextNum}...`)

      const { data: insertData, error: insertError } = await supabase.from('matches').insert(nextMatches).select()

      if (insertError) {
        log(`[ERROR] Insert failed: ${insertError.message}`)
        throw new Error(`Failed to insert matches: ${insertError.message}`)
      }

      log(`[DEBUG] Successfully inserted ${insertData?.length || 0} matches`)
    } else {
      log(`[ERROR] Unknown action: ${action}`)
      throw new Error(`Unknown action: ${action}`)
    }

    log('[DEBUG] Edge function completed successfully')

    return new Response(JSON.stringify({ message: 'Success', debug: debugLog }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[ERROR]', error.message)
    debugLog.push(`[ERROR] ${error.message}`)
    return new Response(JSON.stringify({ error: error.message, debug: debugLog }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})