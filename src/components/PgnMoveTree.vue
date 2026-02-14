<template>
  <span class="move-tree-node">
    <span
      v-if="moveData.color === 'w' || (basePath.length > 0 && moveData.color === 'b' && !moveData.prev)"
      class="move-number"
    >
      {{ moveData.moveNumber || Math.floor((moveData.ply + 1) / 2) }}.{{
        moveData.color === 'b' ? '..' : '' }}&nbsp;
    </span>

    <span
      class="move-san"
      :class="{
        'active-move-san': isActiveMove,
        'selected-variation-path': isSelectedVariation && !isActiveMove
      }"
      @click.stop="selectMove"
    >
      {{ moveData.san }} </span>

    <template v-if="moveData.variations && moveData.variations.length > 0">
      <div 
        v-for="(variation, varIndex) in moveData.variations" 
        :key="varIndex"
        class="move-variation"
        :class="{ 'active-variation': isVariationActive(variation) }"
      >
        (
        <PgnMoveTree
          v-for="move in variation"
          :key="move.ply"
          :moveData="move"
          :currentFen="currentFen"
          :activePath="activePath"
          :basePath="path"
          @select-move="$emit('select-move', $event)"
        />
        )
      </div>
    </template>

    <PgnMoveTree
      v-if="moveData.next"
      :moveData="moveData.next"
      :currentFen="currentFen"
      :activePath="activePath"
      :basePath="path"
      @select-move="$emit('select-move', $event)"
    />
  </span>
</template>

<script setup>
import { computed } from 'vue';
// This component imports itself for recursion
import PgnMoveTree from './PgnMoveTree.vue'; // <-- Make sure this path is correct!

const props = defineProps({
  moveData: { type: Object, required: true },
  currentFen: { type: String, required: true },
  activePath: { type: Array, default: () => [] },
  basePath: { type: Array, default: () => [] }
});

const emit = defineEmits(['select-move']);

// Use 'ply' (half-move number) as the unique, stable ID for the path
const path = computed(() => {
  return [...props.basePath, props.moveData.ply]; 
});

// This move is the *exact* move the board is showing
const isActiveMove = computed(() => {
  return props.moveData.notation.fen === props.currentFen;
});

// This move is *on the path* to the active move, but not the active move itself
const isSelectedVariation = computed(() => {
  if (!props.activePath || props.activePath.length === 0 || isActiveMove.value) return false;
  // Check if the current move's path is a *prefix* of the active path
  return props.activePath.length > path.value.length &&
         path.value.every((p, i) => p === props.activePath[i]);
});

// This variation *contains* the active move
const isVariationActive = (variation) => {
  if (!props.activePath || variation.length === 0) return false;
  const firstMoveOfVariation = variation[0];
  const variationPath = [...path.value, firstMoveOfVariation.ply];
  
  return props.activePath.length >= variationPath.length &&
         variationPath.every((p, i) => p === props.activePath[i]);
};

// Emit all necessary info when a move is clicked
const selectMove = () => {
  emit('select-move', { 
    fen: props.moveData.notation.fen, 
    san: props.moveData.san, 
    path: path.value // Send the full path
  });
};
</script>

<style scoped>
.move-tree-node {
  display: inline;
  line-height: 1.8;
}

.move-number {
  color: #adb5bd;
  margin-right: 4px;
  font-weight: 600;
  white-space: nowrap;
}

.move-san {
  padding: 3px 5px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 4px;
  transition: background-color 0.2s ease, color 0.2s ease;
  white-space: nowrap;
}

.move-san:hover {
  background-color: #495057;
  color: #FFD700;
}

/* This is the *exact* move the board is showing */
.active-move-san {
  background-color: #FFD700;
  color: #111;
  font-weight: 700;
  box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
}

/* This is a move *on the path* to the active move */
.selected-variation-path {
  background-color: rgba(108, 117, 125, 0.2); 
  color: #fff;
  font-weight: 600;
}

/* This is the branching variation block */
.move-variation {
  display: inline-block;
  margin-left: 8px;
  margin-right: 4px;
  background-color: #3e444b;
  border-radius: 5px;
  padding: 0 5px;
  box-shadow: inset 0 0 3px rgba(0,0,0,0.3);
  vertical-align: middle;
  font-size: 0.9em;
}

/* Highlight the whole variation block if it's part of the active path */
.move-variation.active-variation {
  background-color: #555c63;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.move-tree-node .move-tree-node {
    margin-left: 0;
}
</style>