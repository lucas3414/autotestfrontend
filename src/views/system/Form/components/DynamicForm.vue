<template>
  <el-form :model="fields" v-bind="$attrs" ref="myELForm">
    <el-row :gutter="20">
      <template v-for="(item, index) in formItems" :key="index">
        <el-col :span="8">
          <el-form-item v-bind="item">
            <slot v-if="item.myType==='slot'" :name="item.slotName" :data="{item}">
            </slot>
            <component v-else :is="item.myType" :item="item" v-bind="item" v-model:value="fields[item.prop]"></component>
          </el-form-item>
        </el-col>

      </template>
    </el-row>
  </el-form>
</template>

<script setup>
import {ref, watch} from "vue";

const prop = defineProps({
  fields: {
    type: Object,
    default: {}
  },
  formItems: {
    type: Array,
    default: []
  }
})

const myFormItems = ref()
watch(() => prop.formItems, () => {
  myFormItems.value = prop.formItems
}, {immediate: true, deep: true})
const myELForm = ref()
defineExpose({myELForm})


</script>

<style scoped lang="scss">

</style>