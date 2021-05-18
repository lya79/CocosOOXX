const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Prefab)
    item: cc.Prefab = null // 九宮格的格子

    @property
    width: number = 100 // 九宮格的格子寬度

    @property
    height: number = 100 // 九宮格的格子高度

    @property
    spacing: number = 30 // 九宮格的格子間距

    @property
    offsetX: number = 0 // 九宮格的格子左右偏移

    @property
    offsetY: number = 0 // 九宮格的格子上下偏移

    @property
    scaleFlag: number = 0.6 // OX的大小縮放比例

    @property
    ooName: string = "OO" // OX的大小縮放比例

    @property
    xxName: string = "XX" // OX的大小縮放比例

    row: number = 3 // 列數
    column: number = 3 // 欄數
    bingo: number = 3; // 幾個格子連線代表賓果

    itemPool: cc.NodePool
    itemGrid: cc.Node[][] // 用來存放顯示在畫面中的九宮格

    currentRound: number // 奇數局O, 偶數局X
    ooPlayer: boolean // 判斷玩家屬於 oo還是 xx

    start() {
        {// 初始化九宮格物件池
            this.itemPool = new cc.NodePool()
            let initCount = this.row * this.column
            for (let i = 0; i < initCount; i++) {
                let item = cc.instantiate(this.item)
                this.itemPool.put(item)
            }
        }

        this.menuStage()
    }

    onDestroy() {// TODO

    }

    clickPlayer(event, ooPlayer: string) {
        this.ooPlayer = true
        if (ooPlayer != "true") {
            this.ooPlayer = false
        }
        {// 更新 UI
            this.node.getChildByName("modifyName").active = true
        }

        {// 更新輸入框
            let inputComponent = this.node.getChildByName("modifyName").getChildByName("name").getChildByName("input").getChildByName("input").getComponent(cc.EditBox)
            inputComponent.placeholder = "Enter UserName"
            inputComponent.string = this.ooPlayer ? this.ooName : this.xxName
        }
    }

    clickStart() {
        { // 設定玩家名稱
            let inputComponent = this.node.getChildByName("modifyName").getChildByName("name").getChildByName("input").getChildByName("input").getComponent(cc.EditBox)
            if (this.ooPlayer) { // player o
                this.ooName = inputComponent.string
            } else {// player x
                this.xxName = inputComponent.string
            }
        }

        {// 初始化局數
            this.currentRound = 0
        }

        {// 更新 UI
            this.node.getChildByName("modifyName").active = false
            this.node.getChildByName("menu").getChildByName("menu").active = false
        }

        {// 繪製九宮格
            for (let r = 0; r < this.row; r++) {

                this.itemGrid[r] = []

                for (let c = 0; c < this.column; c++) {
                    let item = null;
                    if (this.itemPool.size() > 0) {
                        item = this.itemPool.get();
                    } else {
                        item = cc.instantiate(this.item)
                    }

                    this.itemGrid[r][c] = item

                    this.node.addChild(item)

                    let x, y;
                    {
                        let gridWidth = this.row * this.width + ((this.row - 1) * this.spacing)
                        let gridHeight = this.column * this.height + ((this.column - 1) * this.spacing)
                        let startX = 0 - (gridWidth / 2) + (this.width / 2) + this.offsetX
                        let startY = 0 + (gridHeight / 2) - (this.height / 2) + this.offsetY

                        x = startX + (c * (this.width + this.spacing))
                        y = startY - (r * (this.height + this.spacing))
                    }

                    item.setPosition(cc.v2(x, y))
                    item.width = this.width
                    item.height = this.height

                    item.getComponent("item").init(
                        r, c,
                        this,
                        this.width * this.scaleFlag,
                        this.height * this.scaleFlag
                    )
                }
            }
        }

        if (!this.ooPlayer) {
            this.computer()
        }
    }

    computer() {// 電腦下棋
        for (let r = 0; r < this.row; r++) {
            for (let c = 0; c < this.column; c++) {
                let item = this.itemGrid[r][c].getComponent("item");
                let value = item.getPlayer()
                if (value == -1) {
                    item.pcPress()
                    return
                }
            }
        }
    }

    isPlayerORound(): boolean {
        return this.currentRound % 2 == 1
    }

    selectItem(itemObj: any, player: boolean) {
        this.currentRound += 1 // 局數更新
        itemObj.setOX(this.isPlayerORound())
        let winner = this.checkWinner(itemObj.getRow(), itemObj.getColumn())
        if (winner == 1 || winner == 2) {// o獲勝 || // x獲勝
            this.finishStage(winner)
            return
        } else if (this.currentRound == this.row * this.column) { // 平手
            this.finishStage(0)
            return
        }

        if (player) {
            this.computer()
        }
    }

    checkWinner(selectedRow: number, selectedColunn: number): number {// 其他:沒人獲勝, 1:o獲勝, 2:x獲勝 
        let self = this
        let getValue = function (r: number, c: number): number {
            return self.itemGrid[r][c].getComponent("item").getPlayer()
        }

        let target = getValue(selectedRow, selectedColunn)

        { //上下
            let count = 0
            {// 往上檢查
                let r = selectedRow
                let c = selectedColunn

                for (; ;) {
                    r -= 1
                    if (r < 0) {
                        break
                    }
                    let value = getValue(r, c)
                    if (value != target) {
                        break
                    }
                    count += 1
                }
            }
            {// 往下檢查
                let r = selectedRow
                let c = selectedColunn

                for (; ;) {
                    r += 1
                    if (r >= this.row) {
                        break
                    }
                    let value = getValue(r, c)
                    if (value != target) {
                        break
                    }
                    count += 1
                }
            }

            if (count >= this.bingo - 1) {
                return target
            }
        }

        {//左右
            let count = 0
            {// 往左檢查
                let r = selectedRow
                let c = selectedColunn

                for (; ;) {
                    c -= 1
                    if (c < 0) {
                        break
                    }
                    let value = getValue(r, c)
                    if (value != target) {
                        break
                    }
                    count += 1
                }
            }
            {// 往右檢查
                let r = selectedRow
                let c = selectedColunn

                for (; ;) {
                    c += 1
                    if (c >= this.column) {
                        break
                    }
                    let value = getValue(r, c)
                    if (value != target) {
                        break
                    }
                    count += 1
                }
            }
            if (count >= this.bingo - 1) {
                return target
            }
        }


        {//左上右下
            let count = 0
            {// 往左上檢查
                let r = selectedRow
                let c = selectedColunn

                for (; ;) {
                    r -= 1
                    if (r < 0) {
                        break
                    }
                    c -= 1
                    if (c < 0) {
                        break
                    }
                    let value = getValue(r, c)
                    if (value != target) {
                        break
                    }
                    count += 1
                }
            }
            {// 往左下檢查
                let r = selectedRow
                let c = selectedColunn

                for (; ;) {
                    r += 1
                    if (r >= this.row) {
                        break
                    }
                    c -= 1
                    if (c < 0) {
                        break
                    }
                    let value = getValue(r, c)
                    if (value != target) {
                        break
                    }
                    count += 1
                }
            }
            if (count >= this.bingo - 1) {
                return target
            }
        }


        {//右上左下
            let count = 0
            {// 往右上檢查
                let r = selectedRow
                let c = selectedColunn

                for (; ;) {
                    r -= 1
                    if (r < 0) {
                        break
                    }
                    c += 1
                    if (c >= this.column) {
                        break
                    }
                    let value = getValue(r, c)
                    if (value != target) {
                        break
                    }
                    count += 1
                }
            }
            {// 往右下檢查
                let r = selectedRow
                let c = selectedColunn

                for (; ;) {
                    r += 1
                    if (r >= this.row) {
                        break
                    }
                    c += 1
                    if (c >= this.column) {
                        break
                    }
                    let value = getValue(r, c)
                    if (value != target) {
                        break
                    }
                    count += 1
                }
            }
            if (count >= this.bingo - 1) {
                return target
            }
        }


        return -1
    }

    menuStage() {
        {// 更新 UI
            this.node.getChildByName("info").active = false
            this.node.getChildByName("modifyName").active = false

            let rootNode = this.node.getChildByName("menu")
            rootNode.active = true

            let menuNode = rootNode.getChildByName("menu")
            menuNode.active = true
        }

        {// 清除九宮格
            if (this.itemGrid != undefined) {
                for (let r = 0; r < this.itemGrid.length; r++) {
                    for (let c = 0; c < this.itemGrid[r].length; c++) {
                        let item = this.itemGrid[r][c]
                        this.itemPool.put(item)
                    }
                }
            }
            this.itemGrid = []
        }
    }

    finishStage(winner: number) {// 0:平手, 1:o獲勝, 2:x獲勝
        let rootNode
        {// 更新 UI
            rootNode = this.node.getChildByName("info")
            rootNode.zIndex = cc.macro.MAX_ZINDEX
            rootNode.active = true
        }

        {// 更新訊息
            let text = "獲勝"
            if (winner == 1) {
                text = this.ooName + text
            } else if (winner == 2) {
                text = this.xxName + text
            } else {
                text = "平手"
            }

            rootNode.getChildByName("info").getChildByName("info").getComponent(cc.Label).string = text
        }

        {// 鎖定格子
            for (let r = 0; r < this.row; r++) {
                for (let c = 0; c < this.column; c++) {
                    this.itemGrid[r][c].getComponent("item").setLock(true);
                }
            }
        }
    }
}
