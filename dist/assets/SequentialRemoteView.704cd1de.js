import{d,u as _,H as i,_ as m,o as l,c as g,a as n,w as f,v as C,b as o,V as w,r as A,e as v,f as s,g as S,h as $,i as k}from"./index.5d7d57f7.js";import{c,S as h,T as H,L as a,A as b,d as y}from"./remote-helpers.bf54a892.js";const V=d({name:"SequentialRemoteControl",setup(){const e=_();return e.sequentialMode=!0,e.clearCommands(),{carRemoteUrl:c,legoHubStore:e,HUB_COMMANDS:i}},data(){return{commandsIssued:0,pixiApp:null,carRemote:{sprite:new h(H.EMPTY),gridPosition:[0,0],rotation:0}}},mounted(){this.initPixi()},unmounted(){var e,t;(e=a.shared.resources.carRemote.texture)==null||e.destroy(!0),a.shared.reset(),this.carRemote.sprite.destroy(!0),(t=this.pixiApp)==null||t.destroy(!0)},methods:{tick(){const e=Math.min(this.pixiApp.renderer.width/this.carRemote.sprite.texture.width,this.pixiApp.renderer.height/this.carRemote.sprite.texture.height);this.carRemote.sprite.width=this.carRemote.sprite.texture.width*e,this.carRemote.sprite.height=this.carRemote.sprite.texture.height*e,this.carRemote.sprite.x=this.pixiApp.renderer.width/2,this.carRemote.sprite.y=this.pixiApp.renderer.height/2,this.carRemote.sprite.angle<this.carRemote.rotation?(this.carRemote.sprite.angle+=2,this.carRemote.sprite.angle>this.carRemote.rotation&&(this.carRemote.sprite.angle=this.carRemote.rotation)):this.carRemote.sprite.angle>this.carRemote.rotation&&(this.carRemote.sprite.angle-=2,this.carRemote.sprite.angle<this.carRemote.rotation&&(this.carRemote.sprite.angle=this.carRemote.rotation))},initPixi(){const e=this.$refs.remoteContainer;this.pixiApp=new b({resizeTo:e,backgroundAlpha:0}),e.appendChild(this.pixiApp.view),a.shared.add("carRemote",c).load((t,r)=>{this.carRemote.sprite=new h(r.carRemote.texture),this.carRemote.sprite.anchor.set(.5),this.carRemote.sprite.interactive=!0,this.carRemote.sprite.on("mousedown",this.handleClick),this.carRemote.sprite.on("touchstart",this.handleClick),this.pixiApp.stage.addChild(this.carRemote.sprite),this.pixiApp.ticker.add(this.tick)})},handleClick(e){const t=y(e.data.global,this.carRemote);t&&t==i.FORWARD?this.legoHubStore.addCommand({cmd:i.FORWARD,rotationContext:this.carRemote.rotation}):t&&t==i.BACKWARD?this.legoHubStore.addCommand({cmd:i.BACKWARD,rotationContext:this.carRemote.rotation}):t&&t==i.LEFT?(this.legoHubStore.addCommand({cmd:i.LEFT,rotationContext:this.carRemote.rotation}),this.carRemote.rotation-=90):t&&t==i.RIGHT?(this.legoHubStore.addCommand({cmd:i.RIGHT,rotationContext:this.carRemote.rotation}),this.carRemote.rotation+=90):console.log("not detected")}}}),B={class:"h-100 w-100 d-flex flex-row justify-center align-center"},T={class:"h-100 flex-grow-1",ref:"remoteContainer"},q={class:"flex-grow-0"};function D(e,t,r,p,u,R){return l(),g("div",B,[n("div",T,null,512),n("div",q,[f(o(w,{color:"primary",icon:"mdi-chevron-right",size:"x-large",to:"/direct-grid"},null,512),[[C,e.commandsIssued>2]])])])}var L=m(V,[["render",D]]);const M=d({name:"RemoteView",components:{SequentialRemoteControl:L}});function E(e,t,r,p,u,R){const x=A("sequential-remote-control");return l(),v(S,{class:"h-100"},{default:s(()=>[o($,{class:"h-100"},{default:s(()=>[o(k,{class:"h-100 d-flex justify-center align-center",cols:"12"},{default:s(()=>[o(x)]),_:1})]),_:1})]),_:1})}var P=m(M,[["render",E]]);export{P as default};
