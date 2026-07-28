/* ==========================================
   Galaxy UI
   mod.js
========================================== */

(() => {
"use strict";

/*==========================================
    Galaxy
==========================================*/

const Galaxy={

    open:false,

    ui:null,
    wheel:null,
    center:null,

    buttons:[],

    angle:0,

    speed:0.15,

    paused:false

};


/*==========================================
    ボタン一覧
==========================================*/

const CATEGORIES=[

    "Combat",
    "Movement",
    "Render",
    "Player",
    "Utility",
    "World",
    "Visual",
    "Settings"

];


/*==========================================
    作成
==========================================*/

function createUI(){

    Galaxy.ui=document.createElement("div");
    Galaxy.ui.id="galaxy-ui";

    Galaxy.ui.innerHTML=`

<div id="galaxy-overlay"></div>

<div id="galaxy-wheel">

    <div id="galaxy-ring" class="galaxy-spin"></div>

    <div id="galaxy-center">
        <span id="galaxy-center-text">
            Galaxy
        </span>
    </div>

</div>

`;

    document.body.appendChild(Galaxy.ui);

    Galaxy.wheel=
        document.getElementById("galaxy-wheel");

    Galaxy.center=
        document.getElementById("galaxy-center");

}


/*==========================================
    ボタン生成
==========================================*/

function createButtons(){

    const radius=180;

    const total=CATEGORIES.length;

    for(let i=0;i<total;i++){

        const angle=
            (Math.PI*2/total)*i;

        const x=
            Math.cos(angle)*radius;

        const y=
            Math.sin(angle)*radius;

        const btn=
            document.createElement("div");

        btn.className="galaxy-button";

        btn.style.left=
            `calc(50% + ${x}px)`;

        btn.style.top=
            `calc(50% + ${y}px)`;

        btn.innerHTML=`
        <span class="galaxy-label">
            ${CATEGORIES[i]}
        </span>
        `;

        btn.dataset.module=
            CATEGORIES[i];

        Galaxy.wheel.appendChild(btn);

        Galaxy.buttons.push(btn);

    }

}


/*==========================================
    開閉
==========================================*/

function toggleGalaxy(){

    Galaxy.open=!Galaxy.open;

    Galaxy.ui.classList.toggle(
        "show",
        Galaxy.open
    );

}


/*==========================================
    キー
==========================================*/

document.addEventListener("keydown",e=>{

    if(e.code==="AltRight"){

        e.preventDefault();

        toggleGalaxy();

    }

});


/*==========================================
    初期化
==========================================*/

createUI();

createButtons();

console.log("Galaxy UI Loaded");

})();
/*==========================================
    アニメーション
==========================================*/

function animate(){

    if(!Galaxy.paused){

        Galaxy.angle+=Galaxy.speed;

    }

    Galaxy.wheel.style.transform=
        `rotate(${Galaxy.angle}deg)`;


    /*=========================
        文字は逆回転
    =========================*/

    Galaxy.buttons.forEach(button=>{

        const label=
            button.querySelector(".galaxy-label");

        if(label){

            label.style.transform=
                `translate(-50%,-50%) rotate(${-Galaxy.angle}deg)`;

        }

    });


    const centerText=
        document.getElementById("galaxy-center-text");

    if(centerText){

        centerText.style.transform=
            `translate(-50%,-50%) rotate(${-Galaxy.angle}deg)`;

    }

    requestAnimationFrame(animate);

}


/*==========================================
    ホバー
==========================================*/

Galaxy.buttons.forEach(button=>{

    button.addEventListener("mouseenter",()=>{

        Galaxy.paused=true;

        Galaxy.wheel.classList.add("pause");

        Galaxy.wheel.classList.add("galaxy-wheel-hover");

    });


    button.addEventListener("mouseleave",()=>{

        Galaxy.paused=false;

        Galaxy.wheel.classList.remove("pause");

        Galaxy.wheel.classList.remove("galaxy-wheel-hover");

    });

});


Galaxy.center.addEventListener("mouseenter",()=>{

    Galaxy.paused=true;

    Galaxy.wheel.classList.add("pause");

});


Galaxy.center.addEventListener("mouseleave",()=>{

    Galaxy.paused=false;

    Galaxy.wheel.classList.remove("pause");

});


/*==========================================
    開始
==========================================*/

requestAnimationFrame(animate);
/*==========================================
    ボタンエフェクト
==========================================*/

Galaxy.buttons.forEach(button=>{

    button.addEventListener("mousemove",e=>{

        const rect=button.getBoundingClientRect();

        const x=
            e.clientX-
            rect.left-
            rect.width/2;

        const y=
            e.clientY-
            rect.top-
            rect.height/2;

        button.style.transform=

            `translate(${x*0.08}px,${y*0.08}px)
             scale(1.15)`;

    });


    button.addEventListener("mouseleave",()=>{

        button.style.transform="";

    });

});


/*==========================================
    ON OFF
==========================================*/

Galaxy.buttons.forEach(button=>{

    button.dataset.enabled="false";

});


function setModuleState(button,state){

    button.dataset.enabled=state;

    if(state==="true"){

        button.classList.add("active");

    }else{

        button.classList.remove("active");

    }

}


/*==========================================
    ボタン
==========================================*/

Galaxy.buttons.forEach(button=>{

    button.addEventListener("click",()=>{

        const enabled=
            button.dataset.enabled==="true";

        setModuleState(

            button,

            (!enabled).toString()

        );

        console.log(

            button.dataset.module,

            enabled
                ? "OFF"
                : "ON"

        );

    });

});


/*==========================================
    中央クリック
==========================================*/

Galaxy.center.addEventListener("click",()=>{

    toggleGalaxy();

});


/*==========================================
    モジュール接続
==========================================*/

Galaxy.connect=function(name,callback){

    Galaxy.buttons.forEach(button=>{

        if(button.dataset.module===name){

            button.onclick=()=>{

                callback(button);

            };

        }

    });

};


/*==========================================
    接続例
==========================================*/

// Galaxy.connect("Combat",()=>{
//     console.log("Combat");
// });

// Galaxy.connect("Movement",()=>{
//     console.log("Movement");
// });

// Galaxy.connect("Render",()=>{
//     console.log("Render");
// });


console.log("Galaxy Modules Ready");
/*==========================================
    サブメニュー
==========================================*/

const MODULES={

    Combat:[
        "KillAura",
        "Reach",
        "Velocity",
        "Critical"
    ],

    Movement:[
        "AutoSprint",
        "Sprint",
        "Speed",
        "Step"
    ],

    Render:[
        "Crosshair",
        "Zoom",
        "FPS",
        "CPS"
    ],

    Utility:[
        "Translator",
        "Recorder",
        "Optimizer",
        "Keystrokes"
    ],

    Visual:[
        "ESP",
        "FullBright",
        "Tracers",
        "Nametags"
    ],

    Player:[
        "FastPlace",
        "NoFall",
        "AutoTool",
        "ChestStealer"
    ],

    World:[
        "Scaffold",
        "Breaker",
        "Nuker",
        "Timer"
    ]

};


/*==========================================
    現在
==========================================*/

Galaxy.current="main";


/*==========================================
    メニュー削除
==========================================*/

function clearButtons(){

    Galaxy.buttons.forEach(b=>b.remove());

    Galaxy.buttons=[];

}


/*==========================================
    メインメニュー
==========================================*/

function showMain(){

    Galaxy.current="main";

    clearButtons();

    createButtons();

    installButtonEvents();

}


/*==========================================
    サブメニュー
==========================================*/

function showCategory(name){

    Galaxy.current=name;

    clearButtons();

    const list=MODULES[name];

    if(!list)return;

    const radius=170;

    const total=list.length+1;

    for(let i=0;i<total;i++){

        const angle=(Math.PI*2/total)*i;

        const x=Math.cos(angle)*radius;

        const y=Math.sin(angle)*radius;

        const btn=document.createElement("div");

        btn.className="galaxy-button";

        btn.style.left=`calc(50% + ${x}px)`;

        btn.style.top=`calc(50% + ${y}px)`;

        const text=

            i===total-1

            ? "←戻る"

            : list[i];

        btn.innerHTML=`
            <span class="galaxy-label">
                ${text}
            </span>
        `;

        btn.dataset.module=text;

        Galaxy.wheel.appendChild(btn);

        Galaxy.buttons.push(btn);

    }

    installButtonEvents();

}


/*==========================================
    イベント
==========================================*/

function installButtonEvents(){

    Galaxy.buttons.forEach(button=>{

        button.addEventListener("click",()=>{

            const name=button.dataset.module;

            if(name==="←戻る"){

                showMain();

                return;

            }

            if(Galaxy.current==="main"){

                showCategory(name);

                return;

            }

            console.log("Module:",name);

        });

    });

}


/*==========================================
    初回
==========================================*/

installButtonEvents();

