/*
 * @Author: Kowaine
 * @Description: 尝试使用H5 Canvas来提升性能
 * @Date: 2021-01-16 07:40:37
 * @LastEditTime: 2021-01-16 09:33:40
 */


class Lifegame {
    /**
     * 构造函数
     * @param {String} containerSelector 容器元素的css选择器
     * @param {Number} initPer 初始存活率
     * @param {Number} cellSize 每个细胞的大小(px)
     * @param {Number} minCount 最少细胞数量
     */
    constructor(containerSelector, initPer=37.5, cellSize=5, minCount=100000) {
        this.__container = $(containerSelector);
        this.__initPer = initPer;
        this.__cellSize = cellSize;
        this.__minCount = minCount;
        this.__init_board();
    }

    /**
     * 初始化游戏
     */
    __init_board() {
        this.__container.empty();
        this.__cellsStatus = Array();

        // 根据container宽度确定列数
        let containerWidth = this.__container.width();
        let xCount = Math.floor(containerWidth / this.__cellSize);
        let maxX = Math.ceil(Math.sqrt(this.__minCount));
        xCount = xCount > maxX ? maxX : xCount;
        let yCount = Math.ceil(this.__minCount / xCount);
        this.__xCount = xCount;
        this.__yCount = yCount;

        // 画布
        let lifegameCanvas = $("<canvas>");
        lifegameCanvas.attr("id", "lifegame-canvas");
        lifegameCanvas.attr("width", this.__xCount * this.__cellSize + "px");
        lifegameCanvas.attr("height", this.__yCount * this.__cellSize + "px"); 
        this.__container.append(lifegameCanvas)

        console.log(containerWidth, this.__minCount, xCount, yCount)

        // 决定初始生存细胞
        let liveCount = 0;
        let maxLiveCount = Math.ceil(this.__xCount * this.__yCount * this.__initPer * 0.01);


        // 绘图，初始化状态
        let canvas = $("#lifegame-canvas").get(0);
        this.__ctx = canvas.getContext("2d");
        this.__updatedIndex = new Array();
        for(let i = 0; i < yCount + 2; ++i) {
            let lineStatus = new Array();
            for(let j = 0; j < xCount + 2; ++j) {
                this.__updatedIndex.push([i, j]);
                if(i==0 || i==yCount+1 || j==0 || j==xCount+1) {
                    lineStatus.push(false);
                }
                else {
                    if(liveCount<maxLiveCount && Math.round(Math.random())) {
                        // 若目前为止存活比例超过理论值，则再掷骰子一次，保证分布基本均匀
                        if(liveCount > 0.01 * this.__initPer * (i-1)*this.__yCount + j) {
                            if(Math.round(Math.random()*10) < 7) {
                                liveCount++;
                                lineStatus.push(true);
                            }
                            else {
                                lineStatus.push(false);
                            }
                        }
                        else {
                            liveCount++;
                            lineStatus.push(true);
                        }
                    }
                    else {
                        lineStatus.push(false);
                    }
                }
                // console.log(cell);
            }
            this.__cellsStatus.push(lineStatus);
        }
        this.__updateStatus();
    }

    /**
     * 根据游戏规则重新判断细胞生死
     * 若细胞周围存活3个细胞，则变为生
     * 若2个，则保持状态不变
     * 否则，则变为死
     */
    __judge() {
        // console.log("judeg");
        let newStatus = new Array();
        $.extend(true, newStatus, this.__cellsStatus);
        this.__updatedIndex = new Array();

        for(let i = 1; i < this.__yCount + 1; ++i) {
            for (let j = 1 ; j < this.__xCount + 1; ++j) {
                // 计算每个有效细胞周围的生存细胞数量
                let liveCount = 0;
                if(this.__cellsStatus[i-1][j-1]) liveCount++;
                if(this.__cellsStatus[i-1][j]) liveCount++;
                if(this.__cellsStatus[i-1][j+1]) liveCount++;
                if(this.__cellsStatus[i][j-1]) liveCount++;
                if(this.__cellsStatus[i][j+1]) liveCount++;
                if(this.__cellsStatus[i+1][j-1]) liveCount++;
                if(this.__cellsStatus[i+1][j]) liveCount++;
                if(this.__cellsStatus[i+1][j+1]) liveCount++;

                // 重新计算生死
                // console.log(this.__cellsStatus[i][j], newStatus[i][j]);
                if(liveCount == 3) {
                    newStatus[i][j] = true;
                    // console.log(this.__cellsStatus[i][j], newStatus[i][j]);
                    if(newStatus[i][j] != this.__cellsStatus[i][j]) {
                        this.__updatedIndex.push([i, j]);
                    }
                }
                else if(liveCount == 2) {
                    newStatus[i][j] = this.__cellsStatus[i][j];
                    continue;
                }
                else {
                    newStatus[i][j] = false;
                    if(newStatus[i][j] != this.__cellsStatus[i][j]) {
                        this.__updatedIndex.push([i, j])
                    }
                }
            }
        }

        // 更新状态
        this.__cellsStatus = newStatus;
    }

    /**
     * 将状态更新到html元素上
     */
    __updateStatus() {
        // console.log("update", this.__updatedIndex.length);
        for(let index in this.__updatedIndex) {
            let i = this.__updatedIndex[index][0];
            let j = this.__updatedIndex[index][1];
            if(this.__cellsStatus[i][j]) {
                this.__ctx.fillStyle = "gray";
                let rect = [
                    (j-1) * this.__cellSize,
                    (i-1) * this.__cellSize,
                    this.__cellSize,
                    this.__cellSize
                ];
                this.__ctx.fillRect(...rect);
            }
            else {
                this.__ctx.fillStyle = "black";
                let rect = [
                    (j-1) * this.__cellSize,
                    (i-1) * this.__cellSize,
                    this.__cellSize,
                    this.__cellSize
                ];
                this.__ctx.fillRect(...rect);
            }
        }
    }

    /**
     * 执行
     */
    run_once() {
        // console.log("run");
        this.__judge();
        this.__updateStatus();
    }
}

