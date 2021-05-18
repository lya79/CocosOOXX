// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    lock: boolean

    row: number
    column: number
    main: any

    selected: number

    init(row: number, column: number, main: any, width: number, height: number) {
        this.lock = false

        this.row = row
        this.column = column
        this.main = main

        this.selected = -1

        this.node.getChildByName("o").active = false
        this.node.getChildByName("x").active = false

        this.node.getChildByName("o").width = width
        this.node.getChildByName("o").height = height

        this.node.getChildByName("x").width = width
        this.node.getChildByName("x").height = height

        this.node.on(cc.Node.EventType.MOUSE_DOWN, this.playerPress, this);
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.MOUSE_DOWN, this.playerPress, this);
    }

    playerPress() {
        this.press(true)
    }

    pcPress() {
        this.press(false)
    }

    press(player: boolean) {
        if (this.getLock()) {
            return
        }
        this.setLock(true)

        this.main.selectItem(this, player)
    }

    setLock(lock: boolean) {
        this.lock = lock
    }

    getLock(): boolean {
        return this.lock
    }

    setOX(o: boolean): void {
        if (o) {
            this.node.getChildByName("o").active = true
        } else {
            this.node.getChildByName("x").active = true
        }

        this.selected = o ? 1 : 2
    }

    getPlayer(): number {
        return this.selected
    }

    getRow(): number {
        return this.row
    }

    getColumn(): number {
        return this.column
    }
}
