<template>
  <el-card shadow="never" class="header-card">
    <div class="flx-row">
      <el-form style="margin-right: 10px">
        <el-input placeholder="请输入搜索内容"/>
      </el-form>
      <div class="flex-right">
        <el-button type="primary">搜索</el-button>
        <el-button type="success" @click="dialogVisibleAddShow">新增步骤</el-button>
        <el-button type="warning" @click="runCase">运行</el-button>
        <el-tooltip placement="top">
          <template #content>
            一: 方法说明<br/>
            WebDriverOpenUrl("http://127.0.0.1:8080"),模拟打开浏览器,1个必传参数,url地址<br/>
            WebDriverMaximizeWindow("")，模拟设置最大化窗口<br/>
            SendKeysByXpath("//button//span[text()='登
            录']/..","lucas"),模拟输入框输入,2个必传参数,输入框xpath,输入值<br/>
            ElementAssert("//button//span", "登 录"),模拟设置断言,2个必传参数,元素xpath,预期结果<br/>
            GetElementValueByAttribute("//button//span", "class"),获取当前元素属性值,2个必传参数,元素xpath,属性<br/>
            ClickByXpath("//button//span[text()='登 录']/.."), 模拟点击元素草, 1个必传参数,元素xpath<br/>
            ElementSleep(2),模拟设置休眠时间(s), 1个必传参数, <br/>
            WebDriverQuit(),模拟浏览器退出<br/>
            <hr>
            二: 已支持<br/>
            支持元素拖拉排序执行 <br/>
            <hr>
            二: 即将推出<br/>
            执行后自动生成流程图，实时查看执行情况 <br/>
            定时任务 <br/>
            测试报告分析 <br/>
            ... <br/>

          </template>
          <el-button type="info">使用说明</el-button>
        </el-tooltip>
      </div>
    </div>
  </el-card>
  <el-card shadow="never">
    <el-table :data="case_list" id="dragTable" :header-cell-style="{ backgroundColor: '#ecf5ff' }"
              :cell-style="cellStyle" border stripe style="width: 100%">
      <el-table-column type="selection" width="50"/>
      <el-table-column label="序号" type="index" width="60"/>
      <el-table-column
          v-for="item in options"
          :key="item.type"
          :prop="item.props"
          :label="item.label"
          :width="item.width"
          :align="item.align"
          show-overflow-tooltip
          :fixed="item.fixed"
      >
        <template v-slot:default="scope" v-if="item.props === 'case_break'">
          {{ scope.row[item.props] === "false" ? "继续" : "终止" }}
        </template>

        <template v-slot:default="scope" v-if="item.props === 'method_name'">
          {{ methodNameOptions.filter(kk => kk.id === scope.row[item.props])[0].name }}
        </template>

        <template v-slot:default="scope" v-if="item.props === 'actions'">
          <el-button size="small" type="success" @click="CloneItem(scope)">克隆</el-button>
          <el-button size="small" type="primary" @click="EditeItem(scope)">编辑</el-button>
          <el-button size="small" type="danger" @click="DeleteItem(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
  <el-card shadow="never">
    <el-pagination
        background
        :page-size="queryData.size"
        layout="prev, pager, next"
        :total="total"
        class="mt-4"
        @current-change="handleCurrentChange"
    />
  </el-card>

  <!--对话框-->
  <el-dialog v-model="dialogVisibleAdd" :title="`${title}用例步骤`" :width="dialogWidth" draggable>
    <dynamic-form :fields="caseStepData" :form-items="formItems" ref="myDynamicForm" label-width="auto"/>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisibleAdd = false">取消</el-button>
        <el-button type="primary" @click="onSubmit()">确认</el-button>
      </span>
    </template>
  </el-dialog>


</template>

<script setup>
import Sortable from 'sortablejs'
import { cloneDeep } from 'lodash-es'
function setSort() {
  const el = document.querySelector('#dragTable table tbody')
  new Sortable(el, {
    sort: true,
    ghostClass: 'sortable-ghost',
    onEnd: (e) => {
      const targetRow = case_list.value.splice(e.oldIndex, 1)[0]
      case_list.value.splice(e.newIndex, 0, targetRow)
      console.log(case_list.value)
    },
  })
}

import {onMounted, ref} from "vue";
import {RunCase} from "@/api/modules"
import DynamicForm from "./components/DynamicForm.vue";
import {options} from "@/views/system/CaseStep/options";

const queryData = ref({
  keyWord: '',
  page: 1,
  size: 10,
})
const title = ref('')

const cellStyle = ({row, column, rowIndex, columnIndex}) => {

  if (row.case_break !== "false" && columnIndex === 2) {
    return {'color': '#FFA500'};
  }

  if (row.result === "失败" && (columnIndex === 7 || columnIndex === 8)) {
    return {'color': 'red'};
  }
}

const dialogWidth = ref("50%")

const dialogVisibleAdd = ref(false)
const isEditeDialog = ref(false)
const isCloneDialog = ref(false)
const caseStepData = ref({})
const WebDriverOpenUrlMethodName = (caseStepData, formItems, arg1) => {
  caseStepData.value.example = `打开浏览器, WebDriverOpenUrl("http://127.0.0.1:8080/#/login"), 1个必传参数`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "url"
      item.disabled = false
      item.rules = [{required: true, message: 'url必填', trigger: 'blur'},]
      item.placeholder = '请输入url'
      caseStepData.value.arg1 = arg1
    }
    if (item.prop === 'arg2' || item.prop === 'arg3' || item.prop === 'arg4' || item.prop === 'arg5') {
      item.label = "参数2"
      item.disabled = true
      item.rules = []
      item.style = "display: none"

    }
  })
}
const WebDriverMaximizeWindowMethodName = (caseStepData, formItems, arg1) => {
  caseStepData.value.example = `设置最大化窗口, WebDriverMaximizeWindow("")`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "窗口大小"
      item.placeholder = '请输入窗口大小'
      caseStepData.value.arg1 = arg1
      item.style = "display: flex"
    }
    if (item.prop === 'arg1' || item.prop === 'arg2' || item.prop === 'arg3' || item.prop === 'arg4' || item.prop === 'arg5') {
      item.label = "参数2"
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }
  })
}
const ClickByXpathMethodName = (caseStepData, formItems, arg1) => {
  caseStepData.value.example = `原生点击元素, ClickByXpath("//button//span[text()='登 录']/.."), 1个必传参数`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "xpath"
      item.disabled = false
      item.placeholder = '请输入xpath'
      item.rules = [{required: true, message: 'xpath必填', trigger: 'blur'},]
      caseStepData.value.arg1 = arg1
      item.style = "display: flex"

    }
    if (item.prop === 'arg2' || item.prop === 'arg3' || item.prop === 'arg4' || item.prop === 'arg5') {
      item.label = "参数2"
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }
  })
}
const SendKeysByXpathMethodName = (caseStepData, formItems, arg1, arg2) => {
  caseStepData.value.example = `原生输入框输入, SendKeysByXpath("//button//span[text()='登 录']/..", "lucas"), 2个必传参数`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "xpath"
      item.disabled = false
      item.placeholder = '请输入xpath'
      item.rules = [{required: true, message: 'xpath必填', trigger: 'blur'},]
      caseStepData.value.arg1 = arg1
      item.style = "display: flex"
    }
    if (item.prop === 'arg2') {
      item.label = "输入值"
      item.disabled = false
      item.placeholder = '请输入发送的值'
      item.rules = [{required: true, message: '输入值必填', trigger: 'blur'},]
      caseStepData.value.arg2 = arg2
      item.style = "display: flex"
    }

    if (item.prop === 'arg3' || item.prop === 'arg4' || item.prop === 'arg5') {
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }

  })
}
const WebDriverQuitMethodName = (caseStepData, formItems) => {
  caseStepData.value.example = `浏览器退出, WebDriverQuit()`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1' || item.prop === 'arg2' || item.prop === 'arg3' || item.prop === 'arg4' || item.prop === 'arg5') {
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }
  })
}
const MoveX = (caseStepData, formItems) => {
  caseStepData.value.example = `浏览器退出, WebDriverQuit()`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1' || item.prop === 'arg2' || item.prop === 'arg3' || item.prop === 'arg4' || item.prop === 'arg5') {
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }
  })
}
const ElementSleepMethodName = (caseStepData, formItems, arg1) => {
  caseStepData.value.example = `设置休眠时间(s), ElementSleep(10), 1个必传参数`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "等待时间"
      item.disabled = false
      item.rules = [{required: true, message: '等待时间必填', trigger: 'blur'},]
      item.placeholder = '请输入等待时间'
      caseStepData.value.arg1 = arg1
      item.style = "display: flex"
    }
    if (item.prop === 'arg2' || item.prop === 'arg3' || item.prop === 'arg4' || item.prop === 'arg5') {
      item.disabled = true
      item.rules = []
      item.style = "display: none"

    }
  })
}
const ElementAssertMethodName = (caseStepData, formItems, arg1, arg2) => {
  caseStepData.value.example = `原生元素断言, ElementAssert("//button//span", "登 录"), 2个必传参数`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "xpath"
      item.disabled = false
      item.placeholder = '请输入xpath'
      item.rules = [{required: true, message: 'xpath必填', trigger: 'blur'},]
      caseStepData.value.arg1 = arg1
      item.style = "display: flex"
    }
    if (item.prop === 'arg2') {
      item.label = "预期断言值"
      item.disabled = false
      item.placeholder = '请输入预期断言值'
      item.rules = [{required: true, message: '预期断言值必填', trigger: 'blur'},]
      caseStepData.value.arg2 = arg2
      item.style = "display: flex"
    }

    if (item.prop === 'arg3' || item.prop === 'arg4' || item.prop === 'arg5') {
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }
  })
}
const GetElementValueByAttribute = (caseStepData, formItems, arg1, arg2) => {
  caseStepData.value.example = `获取元素属性值, GetElementValueByAttribute("//button//span", "class"), 2个必传参数`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "xpath"
      item.disabled = false
      item.placeholder = '请输入xpath'
      item.rules = [{required: true, message: 'xpath必填', trigger: 'blur'},]
      caseStepData.value.arg1 = arg1
      item.style = "display: flex"
    }
    if (item.prop === 'arg2') {
      item.label = "元素"
      item.disabled = false
      item.placeholder = '请输入想要获取的元素属性'
      item.rules = [{required: true, message: '元素属性值必填', trigger: 'blur'},]
      caseStepData.value.arg2 = arg2
      item.style = "display: flex"
    }

    if (item.prop === 'arg3' || item.prop === 'arg4' || item.prop === 'arg5') {
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }
  })
}
const ButtonPermission = (caseStepData, formItems, arg1) => {
  caseStepData.value.example = `点击表头按钮, ButtonPermission("新增",), 1个必传参数`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "按钮名称"
      item.disabled = false
      item.placeholder = '请输入按钮名称'
      item.rules = [{required: true, message: '按钮名称必填', trigger: 'blur'},]
      caseStepData.value.arg1 = arg1
      item.style = "display: flex"
    }
    if (item.prop === 'arg2' || item.prop === 'arg3' || item.prop === 'arg4' || item.prop === 'arg5') {
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }
  })
}
const GlobalSearch = (caseStepData, formItems, arg1) => {
  caseStepData.value.example = `全域查询操作, GlobalSearch("sbwx-202501024-0001"), 1个必传参数`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "查询值"
      item.disabled = false
      item.placeholder = '请输入需要查询的值'
      item.rules = [{required: true, message: '查询值必填', trigger: 'blur'},]
      caseStepData.value.arg1 = arg1
      item.style = "display: flex"
    }
    if (item.prop === 'arg2' || item.prop === 'arg3' || item.prop === 'arg4' || item.prop === 'arg5') {
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }
  })
}
const GeneralResetSearch = (caseStepData, formItems, arg1) => {
  caseStepData.value.example = `点击查询或者重置按钮, GlobalSearch("重置"), 1个必传参数`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "按钮名称"
      item.disabled = false
      item.placeholder = '请输入按钮名称'
      item.rules = [{required: true, message: '按钮名称必填', trigger: 'blur'},]
      caseStepData.value.arg1 = arg1
      item.style = "display: flex"
    }
    if (item.prop === 'arg2' || item.prop === 'arg3' || item.prop === 'arg4' || item.prop === 'arg5') {
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }
  })
}
const OrderListSearchByValueAndSelect = (caseStepData, formItems, arg1) => {
  caseStepData.value.example = `根据列表上唯一值进行搜索并选中当条, OrderListSearchByValueAndSelect("列表列唯一值"), 1个必传参数`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "列表列唯一值"
      item.disabled = false
      item.placeholder = '请输入需要查询的值'
      item.rules = [{required: true, message: '查询值必填', trigger: 'blur'},]
      caseStepData.value.arg1 = arg1
      item.style = "display: flex"
    }
    if (item.prop === 'arg2' || item.prop === 'arg3' || item.prop === 'arg4' || item.prop === 'arg5') {
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }
  })
}
const ButtonPermissionSelect = (caseStepData, formItems, arg1, arg2) => {
  caseStepData.value.example = `按钮权限更多操作, ButtonPermissionSelect("业务查询", "订单变更"), 2个必传参数`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "按钮1名称"
      item.disabled = false
      item.placeholder = '请输入按钮1名称'
      item.rules = [{required: true, message: '按钮1名称必填', trigger: 'blur'},]
      caseStepData.value.arg1 = arg1
      item.style = "display: flex"
    }
    if (item.prop === 'arg2') {
      item.label = "按钮2名称"
      item.disabled = false
      item.placeholder = '请输入按钮2名称'
      item.rules = [{required: true, message: '按钮2名称必填', trigger: 'blur'},]
      caseStepData.value.arg2 = arg2
      item.style = "display: flex"
    }

    if (item.prop === 'arg3' || item.prop === 'arg4' || item.prop === 'arg5') {
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }
  })
}
const OrderDetailInput = (caseStepData, formItems, arg1, arg2) => {
  caseStepData.value.example = `表单详情普通文本输入框, OrderDetailInput("表单名称", "输入值"), 2个必传参数`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "表单名称"
      item.disabled = false
      item.placeholder = '请输入表单名称'
      item.rules = [{required: true, message: '表单名称必填', trigger: 'blur'},]
      caseStepData.value.arg1 = arg1
      item.style = "display: flex"
    }
    if (item.prop === 'arg2') {
      item.label = "输入值"
      item.disabled = false
      item.placeholder = '请输入值'
      item.rules = [{required: true, message: '输入值必填', trigger: 'blur'},]
      caseStepData.value.arg2 = arg2
      item.style = "display: flex"
    }

    if (item.prop === 'arg3' || item.prop === 'arg4' || item.prop === 'arg5') {
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }
  })
}
const OrderDetailTextarea = (caseStepData, formItems, arg1, arg2) => {
  caseStepData.value.example = `表单详情富文本输入框, OrderDetailTextarea("表单名称", "输入值"), 2个必传参数`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "表单名称"
      item.disabled = false
      item.placeholder = '请输入表单名称'
      item.rules = [{required: true, message: '表单名称必填', trigger: 'blur'},]
      caseStepData.value.arg1 = arg1
      item.style = "display: flex"
    }
    if (item.prop === 'arg2') {
      item.label = "输入值"
      item.disabled = false
      item.placeholder = '请输入值'
      item.rules = [{required: true, message: '输入值必填', trigger: 'blur'},]
      caseStepData.value.arg2 = arg2
      item.style = "display: flex"
    }

    if (item.prop === 'arg3' || item.prop === 'arg4' || item.prop === 'arg5') {
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }
  })
}
const OrderDetailSelectWithOutDefaultValue = (caseStepData, formItems, arg1, arg2) => {
  caseStepData.value.example = `表单详情没有默认值的下拉框, OrderDetailSelectWithOutDefaultValue("表单名称", "下拉值选项值"), 2个必传参数`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "表单名称"
      item.disabled = false
      item.placeholder = '请输入表单名称'
      item.rules = [{required: true, message: '表单名称必填', trigger: 'blur'},]
      caseStepData.value.arg1 = arg1
      item.style = "display: flex"
    }
    if (item.prop === 'arg2') {
      item.label = "下拉值选项值"
      item.disabled = false
      item.placeholder = '请输入下拉值选项值'
      item.rules = [{required: true, message: '下拉值选项值必填', trigger: 'blur'},]
      caseStepData.value.arg2 = arg2
      item.style = "display: flex"
    }

    if (item.prop === 'arg3' || item.prop === 'arg4' || item.prop === 'arg5') {
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }
  })
}
const OrderDetailSelectWithDefaultValue = (caseStepData, formItems, arg1, arg2) => {
  caseStepData.value.example = `表单详情有默认值的下拉框, OrderDetailSelectWithDefaultValue("表单名称", "下拉值选项值"), 2个必传参数`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "表单名称"
      item.disabled = false
      item.placeholder = '请输入表单名称'
      item.rules = [{required: true, message: '表单名称必填', trigger: 'blur'},]
      caseStepData.value.arg1 = arg1
      item.style = "display: flex"
    }
    if (item.prop === 'arg2') {
      item.label = "下拉值选项值"
      item.disabled = false
      item.placeholder = '请输入下拉值选项值'
      item.rules = [{required: true, message: '下拉值选项值必填', trigger: 'blur'},]
      caseStepData.value.arg2 = arg2
      item.style = "display: flex"
    }

    if (item.prop === 'arg3' || item.prop === 'arg4' || item.prop === 'arg5') {
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }
  })
}
const DigButtonPermission = (caseStepData, formItems, arg1, arg2) => {
  caseStepData.value.example = `对话框按钮, DigButtonPermission("对话框名称", "按钮名称"), 2个必传参数`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "对话框名称"
      item.disabled = false
      item.placeholder = '请输入对话框名称'
      item.rules = [{required: true, message: '对话框名称必填', trigger: 'blur'},]
      caseStepData.value.arg1 = arg1
      item.style = "display: flex"
    }
    if (item.prop === 'arg2') {
      item.label = "按钮名称"
      item.disabled = false
      item.placeholder = '请输入按钮名称'
      item.rules = [{required: true, message: '按钮名称必填', trigger: 'blur'},]
      caseStepData.value.arg2 = arg2
      item.style = "display: flex"
    }

    if (item.prop === 'arg3' || item.prop === 'arg4' || item.prop === 'arg5') {
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }
  })
}
const DigSelectWithOutDefaultDictValue = (caseStepData, formItems, arg1, arg2, arg3) => {
  caseStepData.value.example = `弹出框没有默认值的下拉框且下拉值是数据字典, DigSelectWithOutDefaultDictValue("对话框名称", "表单名称", "下拉值选项值"), 2个必传参数`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "对话框名称"
      item.disabled = false
      item.placeholder = '请输入对话框名称'
      item.rules = [{required: true, message: '对话框名称必填', trigger: 'blur'},]
      caseStepData.value.arg1 = arg1
      item.style = "display: flex"
    }
    if (item.prop === 'arg2') {
      item.label = "表单名称"
      item.disabled = false
      item.placeholder = '请输入表单名称'
      item.rules = [{required: true, message: '表单名称必填', trigger: 'blur'},]
      caseStepData.value.arg2 = arg2
      item.style = "display: flex"
    }

    if (item.prop === 'arg3') {
      item.label = "下拉值选项值"
      item.disabled = false
      item.placeholder = '请输入下拉值选项值'
      item.rules = [{required: true, message: '下拉值选项值必填', trigger: 'blur'},]
      caseStepData.value.arg3 = arg3
      item.style = "display: flex"
    }

    if (item.prop === 'arg4' || item.prop === 'arg5') {
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }
  })
}
const DigSelectWithOutDefaultValue = (caseStepData, formItems, arg1, arg2, arg3) => {
  caseStepData.value.example = `弹出框没有默认值的下拉框, DigSelectWithOutDefaultValue("对话框名称", "表单名称", "下拉值选项值"), 2个必传参数`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "对话框名称"
      item.disabled = false
      item.placeholder = '请输入对话框名称'
      item.rules = [{required: true, message: '对话框名称必填', trigger: 'blur'},]
      caseStepData.value.arg1 = arg1
      item.style = "display: flex"
    }
    if (item.prop === 'arg2') {
      item.label = "表单名称"
      item.disabled = false
      item.placeholder = '请输入表单名称'
      item.rules = [{required: true, message: '表单名称必填', trigger: 'blur'},]
      caseStepData.value.arg2 = arg2
      item.style = "display: flex"
    }

    if (item.prop === 'arg3') {
      item.label = "下拉值选项值"
      item.disabled = false
      item.placeholder = '请输入下拉值选项值'
      item.rules = [{required: true, message: '下拉值选项值必填', trigger: 'blur'},]
      caseStepData.value.arg3 = arg3
      item.style = "display: flex"
    }

    if (item.prop === 'arg4' || item.prop === 'arg5') {
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }
  })
}
const MoveXY = (caseStepData, formItems, arg1, arg2, arg3) => {
  caseStepData.value.example = `弹出框没有默认值的下拉框, DigSelectWithOutDefaultValue("对话框名称", "表单名称", "下拉值选项值"), 2个必传参数`
  formItems.value.forEach((item) => {
    if (item.prop === 'arg1') {
      item.label = "对话框名称"
      item.disabled = false
      item.placeholder = '请输入对话框名称'
      item.rules = [{required: true, message: '对话框名称必填', trigger: 'blur'},]
      caseStepData.value.arg1 = arg1
      item.style = "display: flex"
    }
    if (item.prop === 'arg2') {
      item.label = "表单名称"
      item.disabled = false
      item.placeholder = '请输入表单名称'
      item.rules = [{required: true, message: '表单名称必填', trigger: 'blur'},]
      caseStepData.value.arg2 = arg2
      item.style = "display: flex"
    }

    if (item.prop === 'arg3') {
      item.label = "下拉值选项值"
      item.disabled = false
      item.placeholder = '请输入下拉值选项值'
      item.rules = [{required: true, message: '下拉值选项值必填', trigger: 'blur'},]
      caseStepData.value.arg3 = arg3
      item.style = "display: flex"
    }

    if (item.prop === 'arg4' || item.prop === 'arg5') {
      item.disabled = true
      item.rules = []
      item.style = "display: none"
    }
  })
}

const setMethod = (methodName, caseStepData, formItems, arg1, arg2, arg3) => {
  if (caseStepData.value.method_name === 'WebDriverOpenUrl') {
    WebDriverOpenUrlMethodName(caseStepData, formItems, arg1, arg2)
  }
  if (caseStepData.value.method_name === 'WebDriverMaximizeWindow') {
    WebDriverMaximizeWindowMethodName(caseStepData, formItems, arg1, arg2)
  }
  if (caseStepData.value.method_name === 'ClickByXpath') {
    ClickByXpathMethodName(caseStepData, formItems, arg1, arg2)
  }
  if (caseStepData.value.method_name === 'SendKeysByXpath') {
    SendKeysByXpathMethodName(caseStepData, formItems, arg1, arg2)
  }
  if (caseStepData.value.method_name === 'WebDriverQuit') {
    WebDriverQuitMethodName(caseStepData, formItems, arg1, arg2)
  }
  if (caseStepData.value.method_name === 'MoveX') {
    WebDriverQuitMethodName(caseStepData, formItems, arg1, arg2)
  }
  if (caseStepData.value.method_name === 'ElementSleep') {
    ElementSleepMethodName(caseStepData, formItems, arg1, arg2)
  }
  if (caseStepData.value.method_name === 'ElementAssert') {
    ElementAssertMethodName(caseStepData, formItems, arg1, arg2)
  }
  if (caseStepData.value.method_name === 'GetElementValueByAttribute') {
    GetElementValueByAttribute(caseStepData, formItems, arg1, arg2)
  }
  if (caseStepData.value.method_name === 'ButtonPermission') {
    ButtonPermission(caseStepData, formItems, arg1, arg2)
  }
  if (caseStepData.value.method_name === 'GlobalSearch') {
    GlobalSearch(caseStepData, formItems, arg1, arg2)
  }
  if (caseStepData.value.method_name === 'GeneralResetSearch') {
    GeneralResetSearch(caseStepData, formItems, arg1, arg2)
  }
  if (caseStepData.value.method_name === 'OrderListSearchByValueAndSelect') {
    OrderListSearchByValueAndSelect(caseStepData, formItems, arg1, arg2)
  }
  if (caseStepData.value.method_name === 'ButtonPermissionSelect') {
    ButtonPermissionSelect(caseStepData, formItems, arg1, arg2)
  }
  if (caseStepData.value.method_name === 'DigButtonPermission') {
    DigButtonPermission(caseStepData, formItems, arg1, arg2)
  }
  if (caseStepData.value.method_name === 'OrderDetailInput') {
    OrderDetailInput(caseStepData, formItems, arg1, arg2)
  }
  if (caseStepData.value.method_name === 'OrderDetailTextarea') {
    OrderDetailTextarea(caseStepData, formItems, arg1, arg2)
  }
  if (caseStepData.value.method_name === 'OrderDetailSelectWithOutDefaultValue') {
    OrderDetailSelectWithOutDefaultValue(caseStepData, formItems, arg1, arg2)
  }
  if (caseStepData.value.method_name === 'OrderDetailSelectWithDefaultValue') {
    OrderDetailSelectWithDefaultValue(caseStepData, formItems, arg1, arg2)
  }
  if (caseStepData.value.method_name === 'DigSelectWithOutDefaultDictValue') {
    DigSelectWithOutDefaultDictValue(caseStepData, formItems, arg1, arg2, arg3)
  }
  if (caseStepData.value.method_name === 'DigSelectWithOutDefaultValue') {
    DigSelectWithOutDefaultValue(caseStepData, formItems, arg1, arg2, arg3)
  }
  if (caseStepData.value.method_name === 'MoveXY') {
    MoveXY(caseStepData, formItems, arg1, arg2, arg3)
  }
}

const methodNameOptions = [
  {
    id: 'WebDriverOpenUrl',
    name: '打开浏览器',
  },
  {
    id: 'WebDriverMaximizeWindow',
    name: '浏览器最大化',
  },
  {
    id: 'ClickByXpath',
    name: '点击xpath操作',
  },
  {
    id: 'SendKeysByXpath',
    name: '输入xpath操作',
  },
  {
    id: 'WebDriverQuit',
    name: '关闭浏览器',
  },
  {
    id: 'MoveX',
    name: '移动测试',
  },
  {
    id: 'ElementSleep',
    name: '设置休眠时间',
  },
  {
    id: 'ElementAssert',
    name: 'xpath文本断言',
  },
  {
    id: 'GetElementValueByAttribute',
    name: '获取xpath属性值',
  },
  {
    id: 'ButtonPermission',
    name: '点击列表权限按钮操作',
  },
  {
    id: 'GlobalSearch',
    name: '全域查询',
  },
  {
    id: 'OrderListSearchByValueAndSelect',
    name: '根据列表唯一值查询并选中操作',
  },
  {
    id: 'ButtonPermissionSelect',
    name: '点击列表下拉权限按钮操作',
  },
  {
    id: 'DigButtonPermission',
    name: '点击对话框中按钮',
  },
  {
    id: 'OrderDetailInput',
    name: '表单详情普通输入框输入',
  },
  {
    id: 'OrderDetailTextarea',
    name: '表单详情富文本输入框输入',
  },
  {
    id: 'OrderDetailSelectWithOutDefaultValue',
    name: '表单详情没有默认值的下拉框选择',
  },
  {
    id: 'OrderDetailSelectWithDefaultValue',
    name: '表单详情有默认值的下拉框选择',
  },
  {
    id: 'DigSelectWithOutDefaultDictValue',
    name: '对话框有默认值且默认值来源数据字典的下拉框选择',
  },
  {
    id: 'DigSelectWithOutDefaultValue',
    name: '对话框没有默认值的下拉框选择',
  },
  {
    id: 'MoveXY',
    name: '移动',
  },
]

function onSubmit() {
  caseStepData.value.args = []
  // 发送到后台
  if (caseStepData.value.method_name === "WebDriverOpenUrl" ||
      caseStepData.value.method_name === "WebDriverMaximizeWindow" ||
      caseStepData.value.method_name === "ElementSleep" ||
      caseStepData.value.method_name === "ButtonPermission" ||
      caseStepData.value.method_name === "GeneralResetSearch" ||
      caseStepData.value.method_name === "OrderListSearchByValueAndSelect" ||
      caseStepData.value.method_name === "GlobalSearch" ||
      caseStepData.value.method_name === "ClickByXpath") {
    caseStepData.value.args.push(caseStepData.value.arg1)
  }
  if (caseStepData.value.method_name === "SendKeysByXpath" ||
      caseStepData.value.method_name === "ElementAssert" ||
      caseStepData.value.method_name === "DigButtonPermission" ||
      caseStepData.value.method_name === "ButtonPermissionSelect" ||
      caseStepData.value.method_name === "OrderDetailInput" ||
      caseStepData.value.method_name === "OrderDetailTextarea" ||
      caseStepData.value.method_name === "OrderDetailSelectWithOutDefaultValue" ||
      caseStepData.value.method_name === "OrderDetailSelectWithDefaultValue" ||
      caseStepData.value.method_name === "GetElementValueByAttribute"
  ) {
    caseStepData.value.args.push(caseStepData.value.arg1)
    caseStepData.value.args.push(caseStepData.value.arg2)
  }

  if (caseStepData.value.method_name === "DigSelectWithOutDefaultDictValue" ||
      caseStepData.value.method_name === "DigSelectWithOutDefaultValue" ||
      caseStepData.value.method_name === "MoveXY"
  ) {
    caseStepData.value.args.push(caseStepData.value.arg1)
    caseStepData.value.args.push(caseStepData.value.arg2)
    caseStepData.value.args.push(caseStepData.value.arg3)
  }

  // if (dialogVisibleAdd.value && (!isEditeDialog.value || isCloneDialog.value)) {
  //   case_list.value.push(caseStepData.value)
  // }
  if (dialogVisibleAdd.value && isCloneDialog.value && !isEditeDialog.value) {
    case_list.value.push(caseStepData.value)
  }
  if (dialogVisibleAdd.value && !isCloneDialog.value && !isEditeDialog.value) {
    case_list.value.push(caseStepData.value)
  }
  dialogVisibleAdd.value = false
  isCloneDialog.value = false
  isEditeDialog.value = false
}


const change = (value) => {
  if (value.prop === 'method_name') {
    setMethod(caseStepData.value.method_name, caseStepData, formItems, '', '')
  }
}
const methodNameOptionsProp = {
  label: "name",
  value: "id",
}
const formItems = ref([
  {
    onTrigger: change,
    prop: "method_name",
    myType: "BaseSelect",
    label: "方法名",
    placeholder: "请选择方法",
    multiple: false,
    style: "max-width: 80%",
    optionsProp: methodNameOptionsProp,
    options: methodNameOptions
  },
  {
    prop: "example",
    myType: "BaseInput",
    label: "示例",
    clearable: true,
    placeholder: "",
    disabled: true,
    rules: [],
  },
  {
    onTrigger: change,
    prop: "case_break",
    myType: "BaseSelect",
    placeholder: "请选择",
    label: '报错是否终止',
    multiple: false,
    style: "max-width: 50%",
    optionsProp: {
      label: "name",
      value: "id",
    },
    options: [
      {
        id: "false",
        name: '继续',
      },
      {
        id: "true",
        name: '终止',
      },
    ]
  },
  {
    prop: "arg1",
    "aria-label": "参数1",
    myType: "BaseInput",
    clearable: true,
    placeholder: "请输入参数1",
    label: '参数1',
    disabled: false,
    style: "display: flex",
    rules: [
      {required: true, message: '请输入参数1', trigger: 'blur'},
      // {min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur'},
    ],
  },
  {
    prop: "arg2",
    myType: "BaseInput",
    clearable: true,
    placeholder: "请输入参数2",
    label: '参数2',
    disabled: false,
    style: "display: flex",
    rules: [
      {required: true, message: '请输入参数2', trigger: 'blur'},
      // {min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur'},
    ],
  },
  {
    prop: "arg3",
    myType: "BaseInput",
    clearable: true,
    placeholder: "请输入参数3",
    label: '参数3',
    disabled: false,
    style: "display: flex",
    rules: [
      {required: true, message: '请输入参数3', trigger: 'blur'},
      // {min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur'},
    ],
  },
  {
    prop: "arg4",
    myType: "BaseInput",
    clearable: true,
    placeholder: "请输入参数4",
    label: '参数4',
    disabled: false,
    style: "display: flex",
    rules: [
      {required: true, message: '请输入参数3', trigger: 'blur'},
      // {min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur'},
    ],
  },
  {
    prop: "arg5",
    myType: "BaseInput",
    clearable: true,
    placeholder: "请输入参数5",
    label: '参数5',
    disabled: false,
    style: "display: flex",
    rules: [
      {required: true, message: '请输入参数3', trigger: 'blur'},
      // {min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur'},
    ],
  },
])
const myDynamicForm = ref()
const dialogVisibleAddShow = () => {
  title.value = "新增"
  dialogVisibleAdd.value = true
  isEditeDialog.value = false
  isCloneDialog.value = false
  caseStepData.value = Object.assign({}, {});
  caseStepData.value.start_time = ""
  caseStepData.value.end_time = ""
  caseStepData.value.result = ""
  caseStepData.value.msg = ""
  caseStepData.value.file = ""
  caseStepData.value.case_break = "false"
  caseStepData.value.method_name = "WebDriverOpenUrl"
  setMethod("WebDriverOpenUrl", caseStepData, formItems, ' ', '')
}
const EditeItem = (index) => {
  title.value = "编辑"
  isEditeDialog.value = true
  dialogVisibleAdd.value = true
  isCloneDialog.value = false
  caseStepData.value = index.row
  if (index.row.arg1 === undefined) {
    index.row.arg1 = ''
  }
  if (index.row.arg2 === undefined) {
    index.row.arg2 = ''
  }
  if (index.row.arg3 === undefined) {
    index.row.arg3 = ''
  }
  setMethod(caseStepData.value.method_name, caseStepData, formItems, index.row.arg1, index.row.arg2, index.row.arg3)

}
const CloneItem = (index) => {
  title.value = "克隆"
  isCloneDialog.value = true
  isEditeDialog.value = false
  dialogVisibleAdd.value = true
  caseStepData.value = cloneDeep(index.row)
  if (index.row.arg1 === undefined) {
    index.row.arg1 = ''
  }
  if (index.row.arg2 === undefined) {
    index.row.arg2 = ''
  }
  if (index.row.arg3 === undefined) {
    index.row.arg3 = ''
  }
  setMethod(caseStepData.value.method_name, caseStepData, formItems, index.row.arg1, index.row.arg2, index.row.arg3)

}
const case_list = ref([
  {
    "arg1": "http://10.0.2.155:6400",
    "args": ["http://10.0.2.155:6400"],
    "case_break": "false",
    "end_time": "",
    "file": "",
    "method_name": "WebDriverOpenUrl",
    "msg": "",
    "result": "",
    "start_time": ""
  }, {
    "arg1": "",
    "args": [""],
    "case_break": "false",
    "end_time": "",
    "file": "",
    "method_name": "WebDriverMaximizeWindow",
    "msg": "",
    "result": "",
    "start_time": ""
  }, {
    "arg1": "//input[@placeholder='租户']",
    "arg2": "np",
    "args": ["//input[@placeholder='租户']", "np"],
    "case_break": "false",
    "end_time": "",
    "file": "",
    "method_name": "SendKeysByXpath",
    "msg": "",
    "result": "",
    "start_time": ""
  }, {
    "arg1": "//input[@placeholder='用户名']",
    "arg2": "autotest",
    "args": ["//input[@placeholder='用户名']", "autotest"],
    "case_break": "true",
    "end_time": "",
    "file": "",
    "method_name": "SendKeysByXpath",
    "msg": "",
    "result": "",
    "start_time": ""
  }, {
    "arg1": "//input[@placeholder='密码']",
    "arg2": "abcd1234",
    "args": ["//input[@placeholder='密码']", "abcd1234"],
    "case_break": "false",
    "end_time": "",
    "file": "",
    "method_name": "SendKeysByXpath",
    "msg": "",
    "result": "",
    "start_time": ""
  }, {
    "arg1": "//button//span",
    "arg2": "登 录",
    "args": ["//button//span", "登录"],
    "case_break": "false",
    "end_time": "",
    "file": "",
    "method_name": "ElementAssert",
    "msg": "",
    "result": "",
    "start_time": ""
  }, {
    "arg1": "//button//span[text()='登 录']/..",
    "arg2": "test",
    "args": ["//button//span[text()='登 录']/.."],
    "case_break": "false",
    "end_time": "",
    "file": "",
    "method_name": "ClickByXpath",
    "msg": "",
    "result": "",
    "start_time": ""
  }, {
    "arg1": "2",
    "args": ["2"],
    "case_break": "false",
    "end_time": "",
    "file": "",
    "method_name": "ElementSleep",
    "msg": "",
    "result": "",
    "start_time": ""
  }, {
    "arg1": "http://10.0.2.155:6400/#/tpm/plantMaintenance/faultRepairMgt",
    "arg2": "",
    "arg3": "",
    "arg4": "",
    "arg5": "",
    "args": ["http://10.0.2.155:6400/#/tpm/plantMaintenance/faultRepairMgt"],
    "case_break": "false",
    "end_time": "",
    "example": "打开浏览器, WebDriverOpenUrl('http://127.0.0.1:8080/#/login'), 1个必传参数",
    "file": "",
    "method_name": "WebDriverOpenUrl",
    "msg": "",
    "result": "",
    "start_time": ""
  }, {
    "arg1": "1",
    "arg2": "",
    "arg3": "",
    "arg4": "",
    "arg5": "",
    "args": ["1"],
    "case_break": "false",
    "end_time": "",
    "example": "设置休眠时间(s), ElementSleep(10), 1个必传参数",
    "file": "",
    "method_name": "ElementSleep",
    "msg": "",
    "result": "",
    "start_time": ""
  }, {
    "start_time": "",
    "end_time": "",
    "result": "",
    "msg": "",
    "file": "",
    "case_break": "false",
    "method_name": "ButtonPermission",
    "example": "点击表头按钮, ButtonPermission('新增',), 1个必传参数",
    "arg1": "新增",
    "args": ["新增"]
  }, {
    "start_time": "",
    "end_time": "",
    "result": "",
    "msg": "",
    "file": "",
    "case_break": "false",
    "method_name": "ElementSleep",
    "example": "设置休眠时间(s), ElementSleep(10), 1个必传参数",
    "arg1": "2",
    "args": ["2"]
  }, {
    "start_time": "",
    "end_time": "",
    "result": "",
    "msg": "",
    "file": "",
    "case_break": "false",
    "method_name": "OrderDetailSelectWithOutDefaultValue",
    "example": "表单详情没有默认值的下拉框, OrderDetailSelectWithOutDefaultValue('表单名称', '下拉值选项值'), 2个必传参数",
    "arg1": "报修类别",
    "arg2": "设备报修",
    "args": ["报修类别", "设备报修"]
  },
  {
    "start_time": "",
    "end_time": "",
    "result": "",
    "msg": "",
    "file": "",
    "case_break": "false",
    "method_name": "OrderDetailSelectWithOutDefaultValue",
    "example": "表单详情没有默认值的下拉框, OrderDetailSelectWithOutDefaultValue('表单名称', '下拉值选项值'), 2个必传参数",
    "arg1": "设备编码",
    "arg2": "aacc",
    "args": ["设备编码", "aacc"]
  },{
    "start_time": "",
    "end_time": "",
    "result": "",
    "msg": "",
    "file": "",
    "case_break": "false",
    "method_name": "OrderDetailSelectWithDefaultValue",
    "example": "表单详情有默认值的下拉框, OrderDetailSelectWithDefaultValue('表单名称', '下拉值选项值'), 2个必传参数",
    "arg1": "报修人员",
    "arg2": "autotest",
    "args": ["报修人员", "autotest"]
  }, {
    "start_time": "",
    "end_time": "",
    "result": "",
    "msg": "",
    "file": "",
    "case_break": "false",
    "method_name": "OrderDetailSelectWithOutDefaultValue",
    "example": "表单详情没有默认值的下拉框, OrderDetailSelectWithOutDefaultValue('表单名称', '下拉值选项值'), 2个必传参数",
    "arg1": "报修类型",
    "arg2": "机械故障",
    "args": ["报修类型", "机械故障"]
  }, {
    "start_time": "",
    "end_time": "",
    "result": "",
    "msg": "",
    "file": "",
    "case_break": "false",
    "method_name": "OrderDetailInput",
    "example": "表单详情普通文本输入框, OrderDetailInput('表单名称', '输入值'), 2个必传参数",
    "arg1": "故障影响",
    "arg2": "这个是是故障影响",
    "args": ["故障影响", "这个是是故障影响"]
  }, {
    "start_time": "",
    "end_time": "",
    "result": "",
    "msg": "",
    "file": "",
    "case_break": "false",
    "method_name": "OrderDetailTextarea",
    "example": "表单详情富文本输入框, OrderDetailTextarea('表单名称', '输入值'), 2个必传参数",
    "arg1": "报修内容",
    "arg2": "这个是报修内容",
    "args": ["报修内容", "这个是报修内容"]
  }, {
    "start_time": "",
    "end_time": "",
    "result": "",
    "msg": "",
    "file": "",
    "case_break": "false",
    "method_name": "ButtonPermission",
    "example": "点击表头按钮, ButtonPermission('新增',), 1个必传参数",
    "arg1": "保存",
    "args": ["保存"]
  }, {
    "start_time": "",
    "end_time": "",
    "result": "",
    "msg": "",
    "file": "",
    "case_break": "false",
    "method_name": "ElementSleep",
    "example": "设置休眠时间(s), ElementSleep(10), 1个必传参数",
    "arg1": "1",
    "args": ["1"]
  }, {
    "start_time": "",
    "end_time": "",
    "result": "",
    "msg": "",
    "file": "",
    "case_break": "false",
    "method_name": "WebDriverOpenUrl",
    "example": "打开浏览器, WebDriverOpenUrl('http://127.0.0.1:8080/#/login'), 1个必传参数",
    "arg1": "http://10.0.2.155:6400/#/tpm/plantMaintenance/repairOrderDistribute",
    "args": ["http://10.0.2.155:6400/#/tpm/plantMaintenance/repairOrderDistribute"]
  }, {
    "start_time": "",
    "end_time": "",
    "result": "",
    "msg": "",
    "file": "",
    "case_break": "false",
    "method_name": "ElementSleep",
    "example": "设置休眠时间(s), ElementSleep(10), 1个必传参数",
    "arg1": "2",
    "args": ["2"]
  }, {
    "start_time": "",
    "end_time": "",
    "result": "",
    "msg": "",
    "file": "",
    "case_break": "false",
    "method_name": "OrderListSearchByValueAndSelect",
    "example": "根据列表上唯一值进行搜索并选中当条, OrderListSearchByValueAndSelect('列表列唯一值'), 1个必传参数",
    "arg1": "sbbx-250124-0029",
    "args": ["sbbx-250124-0029"]
  }, {
    "start_time": "",
    "end_time": "",
    "result": "",
    "msg": "",
    "file": "",
    "case_break": "true",
    "method_name": "ButtonPermissionSelect",
    "example": "按钮权限更多操作, ButtonPermissionSelect('业务查询', '订单变更'), 2个必传参数",
    "arg1": "业务操作",
    "arg2": "维修派发",
    "args": ["业务操作", "维修派发"]
  }, {
    "start_time": "",
    "end_time": "",
    "result": "",
    "msg": "",
    "file": "",
    "case_break": "false",
    "method_name": "DigSelectWithOutDefaultDictValue",
    "example": "弹出框没有默认值的下拉框且下拉值是数据字典, DigSelectWithOutDefaultDictValue('对话框名称', '表单名称', '下拉值选项值'), 2个必传参数",
    "arg1": "维修派发",
    "arg2": "维修类型",
    "arg3": "内修",
    "args": ["维修派发", "维修类型", "内修"]
  }, {
    "start_time": "",
    "end_time": "",
    "result": "",
    "msg": "",
    "file": "",
    "case_break": "false",
    "method_name": "DigSelectWithOutDefaultValue",
    "example": "弹出框没有默认值的下拉框, DigSelectWithOutDefaultValue('对话框名称', '表单名称', '下拉值选项值'), 2个必传参数",
    "arg1": "维修派发",
    "arg2": "维修人员",
    "arg3": "[autotest]",
    "args": ["维修派发", "维修人员", "[autotest]"]
  },
])

function runCase() {
  RunCase({"case_list": case_list.value}).then(res => {
    case_list.value = res.data.data.run
  })

}

const total = ref(0)
const initData = () => {
  // getUserList(queryData.value).then((res) => {
  //   total.value = res.data.data.total
  //   tableData.value = res.data.data.userList
  // })
}
const handleCurrentChange = (val) => {
  queryData.value.page = val
  initData(queryData.value)
}

const DeleteItem = (num) => {
  case_list.value.splice(num, 1)
}

const setDialogWidth = () => {
  console.log(document.body.clientWidth)
  var val = document.body.clientWidth
  const def = 800 // 默认宽度
  if (val < def) {
    dialogWidth.value = '100%'
  } else {
    dialogWidth.value = def + 'px'
  }
}

onMounted(() => {
  setSort()
  setDialogWidth()
  window.onresize = () => {
    return (() => {
      setDialogWidth()
    })()
  }
  initData()
})


</script>

<style scoped lang="scss">

</style>
