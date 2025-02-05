<template>

  <el-row>
    <el-col :span="4">
      <pre>{{ myData }}</pre>
    </el-col>
    <el-col :span="20">
      <el-button @click="check">触发校验</el-button>
      <hr>
      <dynamic-form :fields="myData" :form-items="formItems" ref="myDynamicForm" label-width="auto">
        <template #testSlot="{data}">
          <el-radio-group v-model="myData.myradio" style="width: 100%">
            <el-radio value="1">开</el-radio>
            <el-radio value="2">关</el-radio>
          </el-radio-group>
        </template>
      </dynamic-form>
      <hr>
      <pre>{{ formItems }}</pre>
    </el-col>
  </el-row>
</template>

<script setup>

import DynamicForm from "./components/DynamicForm.vue";
import {ref, reactive} from "vue";


const myData = ref({
  name: "张三",
  sex: "",
  age: 18,
  birthday: "2024-05-01",
  myascader: "",
  myradio: "2",
})

const change = (value) => {
  if (value.prop === 'sex') {
    if (myData.value.sex === '1') {
      myData.value.birthday = ''
      formItems.value.forEach((item) => {
        if(item.prop === 'name'){
          item.disabled = true
          myData.value.name = '下拉联动改变其他组件'
        }
      })
    }
  }
}

const formItems = ref([
  {
    prop: "name",
    "aria-label": "姓名",
    myType: "BaseInput",
    clearable: true,
    placeholder: "请输入姓名",
    disabled: false,
    rules: [
      {required: true, message: '请输入姓名', trigger: 'blur'},
      {min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur'},
    ],
  },
  {
    onTrigger: change,
    prop: "sex",
    "aria-label": "性别",
    myType: "BaseSelect",
    placeholder: "请选择性别",
    multiple: false,
    optionsProp: {
      label: "name",
      value: "id",
    },
    options: [
      {
        id: '0',
        name: '女',
      },
      {
        id: '1',
        name: '男',
      },
      {
        id: '2',
        name: '其他',
      },
    ]
  },
  {
    prop: "birthday",
    "aria-label": "生日",
    myType: "BaseDatePicker",
    placeholder: "请选择日期",
    format: "YYYY-MM-DD",
    "value-format": "YYYY-MM-DD",
  },
  {
    prop: "mycascader",
    "aria-label": "地区",
    myType: "BaseCascader",
    placeholder: "请选择级联",
    props: {
      expandTrigger: 'hover',
    },
    options: [
      {
        value: '0',
        label: '江苏',
        children: [
          {
            value: '01',
            label: '南京',
            children: [
              {
                value: '0101',
                label: '江北',
              },
              {
                value: '0102',
                label: '新街口',
              },
            ],
          },
          {
            value: '02',
            label: '常州',
            children: [
              {
                value: '0201',
                label: '薛家',
              },
            ],
          },
        ],
      },
      {
        value: '03',
        label: '扬州',
        children: [
          {
            value: '0301',
            label: '兴化',
            children: [
              {
                value: '030101',
                label: '海南',
              },
            ],
          },
          {
            value: '0302',
            label: '泰州',
            children: [
              {
                value: '030201',
                label: '东台',
              },
            ],
          },

        ],
      },

    ]
  },
  {
    "aria-label": "插槽",
    myType: "slot",
    slotName: "testSlot"
  },
])

const myDynamicForm = ref()

function check() {
  myDynamicForm.value.myELForm.validate((value) => {
    alert(value)
  })
}

</script>

<style scoped lang="scss">

</style>