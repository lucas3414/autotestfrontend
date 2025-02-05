<template>
  <el-select v-model="val" v-bind="$attrs" @change="onTrigger"  style="width: 100%">
    <el-option
        v-for="option in item.options"
        :key="option[keyProp.value]"
        :label="option[keyProp.label]"
        :value="option[keyProp.value]"
    />
  </el-select>
</template>

<script setup>

import {ref, watch} from "vue";

const val = ref()
const prop = defineProps({
  value: String,
  item: Object
})

const emit = defineEmits(['update:value'])

function onTrigger() {
  emit('update:value', val.value)
  if(prop.item.onTrigger){
    prop.item.onTrigger(prop.item)
  }
}

watch(() => prop.value, () => {
  val.value = prop.value
}, {immediate: true, deep: true})


const keyProp = ref({
  value: "value",
  label: "label",
})

watch(()=>prop.item.optionsProp, ()=>{
  if(prop.item && prop.item.optionsProp){
    keyProp.value.value = prop.item.optionsProp.value
    keyProp.value.label = prop.item.optionsProp.label
  }
},{immediate: true, deep: true})


</script>

<style scoped lang="scss">

</style>