// 最原始的写法会导致页面一致卡顿
const btn = document.querySelector('.btn');
const datas = new Array(100000).fill(0).map((_, i) => i);
// btn.onclick = () => {
//   for(let i of datas){
//     const div = document.createElement('div');
//     div.innerHTML = i;
//     document.body.appendChild(div);
//   }
// };


// **** 普通解决方法
// btn.onclick = () => {
//   performChunk(datas);
// };

// function performChunk(datas) {
//     if(datas.length === 0){
//         return;
//     }
//     let i=0;
//     //一个分片要执行的内容
//     function _run(){
//         requestIdleCallback((idle) => {
//             // 每次执行多长时间不确定，由idle.timeRemaining()来决定
//             while(idle.timeRemaining()>0 && i<datas.length){
//                 //进入分片执行时间
//                 const div = document.createElement('div');
//                 div.innerHTML = i;
//                 document.body.appendChild(div);
//                 i++;
//             }
//             _run();
//         })
//     }
//     _run();
// }


// 高阶函数的 --- 具体任务的提取
// btn.onclick = () => {
//     function taskHandle(data, i){
//         const div = document.createElement('div');
//         div.innerHTML = i;
//         document.body.appendChild(div);
//     }
//     performChunk(datas, taskHandle);
// };

// function performChunk(datas, taskHandle) {
//     if (datas.length === 0) {
//         return;
//     }
//     let i = 0;
//     //一个分片要执行的内容
//     function _run() {
//         requestIdleCallback((idle) => {
//             // 每次执行多长时间不确定，由idle.timeRemaining()来决定
//             while (idle.timeRemaining() > 0 && i < datas.length) {
//                 //进入分片执行时间，
//                 // 具体做什么应该由使用函数的人决定，而不是在这里写固定
//                 taskHandle(datas[i], i);
//                 i++;
//             }
//             _run();
//         })
//     }
//     _run();
// }

// 高阶函数的 --- 兼容多端，在浏览器端是requestIdleCallback，在node端是setImmediate
// 或者用户自己决定什么时候开启下一个任务开始，用户决定每个分片中执行多少个任务
btn.onclick = () => {
    function taskHandle(data, i){
        const div = document.createElement('div');
        div.innerHTML = i;
        document.body.appendChild(div);
    }
    function scheduler(task){
        // 用户自定义的调度器
        // const start = performance.now();
        // setTimeout(() => {
        //     task(() =>{
        //         const end = performance.now();
        //         let res = end - start ;
        //         console.log('rerere:', res);
        //         return res<=15;
        //     });
        // }, 10)

        // 浏览器中分片执行的api写法
        requestIdleCallback((idle) => {
            task(() => idle.timeRemaining());
        })
       
    }
    
    // 默认浏览器环境的话就直接执行
    browserScheduler(datas, taskHandle);

    // 要是自定义任务的话就是
    // performChunk(datas, taskHandle, scheduler);
};

// 
function performChunk(datas, taskHandle, scheduler) {
    // datas 参数归一化，就是datas 参数是数组，不是数组就是数组化
    if(typeof datas === 'number'){
        datas = [];
    }
    if (datas.length === 0) {
        return;
    }
    let i = 0;
    //一个分片要执行的内容
    function _run() {
        // 什么类型的调度器由用户来决定--- 默认是浏览器的requestIdleCallback
        // idle 也有用户决定什么时候可以开始执行
        scheduler((goOn) => {
            // 每次执行多长时间不确定，由idle.timeRemaining()来决定
            console.log('goOn::', goOn(), i);
            while (goOn() && i < datas.length) {
                //进入分片执行时间，
                // 具体做什么应该由使用函数的人决定，而不是在这里写固定
                taskHandle(datas[i], i);
                i++;
            }
            _run();
        })
    }
    _run();
}

// 再为浏览器开一个函数
function browserScheduler(datas, taskHandle){
    const scheduler = (task) => requestIdleCallback((idle) => {
        task(() => idle.timeRemaining());
    });
    performChunk(datas, taskHandle, scheduler);
}