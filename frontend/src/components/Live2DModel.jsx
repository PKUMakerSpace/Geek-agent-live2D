import { useLayoutEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display/cubism4'

// 将 PIXI 暴露到 window 上
window.PIXI = PIXI;

const Live2DDisplay = forwardRef((props, ref) => {
  const pixiContainerRef = useRef(null)
  const appRef = useRef(null)
  const modelRef = useRef(null)

  // 表情映射对象，使用中文作为 key
  const EXPRESSIONS = {
    '吐舌': 'key2',
    '黑脸': 'key3',
    '眼泪': 'key4',
    '脸红': 'key5',
    'nn眼': 'key6',
    '生气瘪嘴': 'key7',
    '死鱼眼': 'key8',
    '生气': 'key9',
    '咪咪眼': 'key10',
    '嘟嘴': 'key11',
    '钱钱眼': 'key12',
    '爱心': 'key16',
    '泪眼': 'key17'
  }

  // 新增：随机表情方法
  const randomExpression = () => {
    const expressions = Object.keys(EXPRESSIONS)
    const randomIndex = Math.floor(Math.random() * expressions.length)
    return expressions[randomIndex]
  }

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    showExpression: (expression, active = true) => {
      if (modelRef.current) {
        const expressionId = EXPRESSIONS[expression];
        if (expressionId) {
          modelRef.current.internalModel.coreModel.setParameterValueById(
            expressionId, 
            active ? 1 : 0
          );
        } else {
          console.warn(`未知的表情: ${expression}`);
        }

        // 新增：设置定时器，在十秒后复位表情
        setTimeout(() => {
          if (modelRef.current && expressionId) {
            modelRef.current.internalModel.coreModel.setParameterValueById(
              expressionId, 
              0 // 将表情参数值重置为 0
            );
            console.log(`表情 ${expression} 已复位`);
          }
        }, 10000); // 10秒后执行复位操作
      }
    },

    // 新增：设置跟踪功能
    setTracking: (enabled) => {
      if (modelRef.current) {
        modelRef.current.autoInteract = enabled;
        modelRef.current.internalModel.motionManager.settings.autoAddRandomMotion = enabled;
        console.log(`模型跟踪功能已${enabled ? '开启' : '关闭'}~`);
      }
    }
  }))

useLayoutEffect(() => {
  // 确保清理之前的内容
  if (appRef.current) {
    appRef.current.destroy(true)
    appRef.current = null
  }
  if (pixiContainerRef.current) {
    while (pixiContainerRef.current.firstChild) {
      pixiContainerRef.current.removeChild(pixiContainerRef.current.firstChild)
    }
  }

  if (!pixiContainerRef.current) return

  // 设置固定大小的画布 (600x800)
  const app = new PIXI.Application({
    width: 600,
    height: 800,
    backgroundColor: 0x000000,
    antialias: true,
  })
  appRef.current = app
  pixiContainerRef.current.appendChild(app.view)

  let isDestroyed = false

  ;(async function() {
    if (modelRef.current) return
    
    try {
      const model = await Live2DModel.from('/models/Hiyori/Hiyori.model3.json')
      // const model = await Live2DModel.from('/models/LuoChu/洛厨.model3.json')

      // 如果组件已经被卸载，不要继续处理
      if (isDestroyed || !appRef.current) return
      
      console.log('Model loaded:', model)
      modelRef.current = model
      
      // 设置模型的初始跟踪状态
      model.internalModel.motionManager.settings.autoAddRandomMotion = true
      model.autoInteract = false
      model.draggable = false
      
      // 计算适合画布的缩放比例
      const scale = Math.min(
        app.view.width / model.width * 1,  // 调整比例以适应右下角位置
        app.view.height / model.height * 1
      );
      model.scale.set(scale);
      
      // 将模型定位在画布的右下角区域（但不完全贴边）
      model.x = app.view.width - (model.width * scale * 0.5) - 30;  // 右边距30像素
      model.y = app.view.height - (model.height * scale * 0.5) - 30; // 下边距30像素
      model.anchor.set(0.5, 0.5);

      app.stage.addChild(model)

      model.on('hit', (hitAreas) => {
        console.log('Hit:', hitAreas)
        model.motion('TapBody')
      })
    } catch (error) {
      console.error('Error loading model:', error)
    }
  })()

  return () => {
    isDestroyed = true
    if (modelRef.current) {
      modelRef.current.destroy()
      modelRef.current = null
    }
    if (appRef.current) {
      appRef.current.destroy(true)
      appRef.current = null
    }
  }
}, [])
  return <div ref={pixiContainerRef} className="live2d-container"></div>
})
// 添加这行给组件命名
Live2DDisplay.displayName = 'Live2DDisplay'
export default Live2DDisplay 