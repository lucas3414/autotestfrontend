export const options = [
    {
        label: '报错是否终止',
        props: 'case_break',
        width: '110px',
        align: 'left'
    },
    {
        label: '方法名',
        props: 'method_name',
        width: '220px',
        align: 'left'
    },
    {
        label: '参数信息',
        props: 'args',
        width: 'auto',
        align: 'left',
        show: true
    },

    {
        label: '开始时间',
        props: 'start_time',
        width: '165',
        align: 'left',
        show: true
    },
    {
        label: '结束时间',
        props: 'end_time',
        width: '165',
        align: 'left',
        show: true
    },
    {
        label: '执行结果',
        props: 'result',
        width: '90',
        align: 'left',
        show: true
    },
    {
        label: '执行返回信息',
        props: 'msg',
        width: 'auto',
        align: 'left',
        show: true
    },
    // {
    //     label: '截图信息',
    //     props: 'file',
    //     width: 'auto',
    //     align: 'left',
    //     show: true
    // },
    {
        label: '操作',
        props: 'actions',
        width: '200',
        align: 'center',
        fixed: 'right',
    }
]