<template>
  <el-input v-model="val" v-bind="$attrs" @input="onTrigger"></el-input>
</template>

<script setup>

import {onRenderTriggered, ref, watch} from "vue";

const val = ref()
const prop = defineProps({
  value: String,
  item: Object
})

const emit = defineEmits(['update:value'])

function onTrigger() {
  emit('update:value', val.value)
}

watch(() => prop.value, () => {
  val.value = prop.value
}, {immediate: true, deep: true})


</script>

<style scoped lang="scss">

</style>