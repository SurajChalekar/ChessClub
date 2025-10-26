<template>
  <div class="profile-page py-5">
     <section class="profile-hero position-relative overflow-hidden">
      <div class="hero-background"></div>
      <div class="chess-pattern-bg"></div>
      <div class="container position-relative z-3">
        <div class="row justify-content-center text-center">
          <div class="col-lg-8">
            <div class="hero-content py-5">
              <div class="hero-badge mb-4">
                <span class="badge bg-gradient-success px-4 py-3 fs-6 rounded-pill">
                  <i class="fas fa-id-card me-2"></i>Club Members
                </span>
              </div>
              <h1 class="hero-title mb-4">
                <span class="chess-icon">👤</span>
                <span class="text-glow-success">Player Profiles</span>
              </h1>
              <p class="hero-subtitle mb-4">
                View your stats or search for other club members.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="profile-content py-5">
      <div class="container">
        <div class="row justify-content-center mb-5">
          <div class="col-md-8 col-lg-6">
            <div class="input-group input-group-lg shadow-lg">
              <input
                type="text"
                class="form-control bg-dark text-light border-secondary"
                placeholder="Search for a player..."
                aria-label="Search player"
                v-model="searchQuery"
                @keyup.enter="performSearch"
              >
              <button class="btn btn-outline-warning" type="button" @click="performSearch">
                <i class="fas fa-search"></i> Search
              </button>
            </div>
          </div>
        </div>

        <div class="row justify-content-center">
          <div class="col-lg-10 col-xl-8">
            <div v-if="!profileData && !searchError && !isLoading" class="text-center text-muted py-4">
              <i class="fas fa-search fa-3x mb-3"></i>
              <p>Search for a player to view their profile.</p>
              <p class="small">(Or connect your account to view your own stats - Coming Soon!)</p>
            </div>

             <div v-if="isLoading" class="text-center text-warning py-4">
                 <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                 Loading profile...
            </div>


            <div v-if="searchError" class="alert alert-danger text-center">
                {{ searchError }}
            </div>


            <div v-if="profileData" class="profile-card bg-dark-secondary rounded shadow-lg p-4">
              <h3 class="text-warning mb-3">{{ profileData.name }}</h3>
              <p class="text-muted">Placeholder for stats (Rating, Wins, Losses, Draws, Tournaments Played)...</p>
              </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const searchQuery = ref('');
const profileData = ref(null); // Will hold fetched profile data
const isLoading = ref(false);
const searchError = ref(null);

onMounted(() => {
  document.title = 'Player Profiles - IISER TVM Chess Club';
});

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    profileData.value = null; // Clear profile if search is empty
    searchError.value = null;
    return;
  }

  isLoading.value = true;
  searchError.value = null;
  profileData.value = null;
  console.log(`Searching for: ${searchQuery.value}`);

  // --- Placeholder Logic ---
  // In the future, this will fetch data from sheets/database
  // For now, simulate a search result or error
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

  if (searchQuery.value.toLowerCase() === 'test player') {
     profileData.value = { name: 'Test Player', rating: 1500, /* ... other stats */ };
  } else {
     searchError.value = `Player "${searchQuery.value}" not found.`;
  }
  // --- End Placeholder ---


  isLoading.value = false;
};

</script>

<style scoped>
/* Base page style */
.profile-page {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
  color: #e0e0e0;
  min-height: 100vh;
}

/* Hero section styles */
.profile-hero {
  background: radial-gradient(ellipse at center, #1a1a2e 0%, #10342a 50%, #0a0a0a 100%); /* Greenish tint */
  padding: 4rem 0;
  min-height: auto;
}
.hero-background { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(45deg, transparent 40%, rgba(25, 135, 84, 0.05) 50%, transparent 60%), linear-gradient(-45deg, transparent 40%, rgba(13, 202, 240, 0.05) 50%, transparent 60%); animation: heroShift 18s ease-in-out infinite alternate; }
.chess-pattern-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.01) 35px, rgba(255,255,255,0.01) 70px), repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(25,135,84,0.01) 35px, rgba(25,135,84,0.01) 70px); opacity: 0.2; }
.hero-title { font-size: 3.5rem; font-weight: 900; letter-spacing: -1px; }
.text-glow-success { background: linear-gradient(45deg, #198754, #20c997); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 30px rgba(25, 135, 84, 0.5); animation: titlePulseSuccess 4s ease-in-out infinite; }
.hero-subtitle { font-size: 1.2rem; opacity: 0.8; line-height: 1.7; max-width: 600px; margin: 0 auto; }
.chess-icon { font-size: 1em; margin-right: 10px; filter: drop-shadow(0 0 15px rgba(25, 135, 84, 0.6)); }

/* Keyframes */
@keyframes heroShift { 0% { transform: translateX(-1px); } 100% { transform: translateX(1px); } }
@keyframes titlePulseSuccess { 0%, 100% { text-shadow: 0 0 30px rgba(25, 135, 84, 0.4); } 50% { text-shadow: 0 0 50px rgba(25, 135, 84, 0.7); } }

/* Content Section */
.profile-content {
   background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
}

/* Search Bar */
.input-group .form-control {
    border-right: 0;
}
.input-group .form-control:focus {
    box-shadow: 0 0 0 0.25rem rgba(255, 193, 7, 0.25); /* Warning glow on focus */
    border-color: #6c757d;
}
.input-group .btn-outline-warning {
    border-left: 0;
}

/* Profile Card */
.bg-dark-secondary {
  background-color: #212529;
}
.profile-card {
  border: 1px solid rgba(255,255,255,0.1);
}
</style>