const {ccclass, property} = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Prefab)
    item: cc.Prefab = null;

    start () {
    }

    clickRestart(){
        cc.log("clickRestart")
    }

    clickPlayer(event, customEventData) {
        cc.log("clickPlayer")
        // cc.log("event", event)
        cc.log("customEventData", customEventData)
        if (customEventData==true){ // player o

        } else {// player x

        }
    }

    menuStage(){

    }

    playingStage(){

    }

    finishStage(){

    }
}
