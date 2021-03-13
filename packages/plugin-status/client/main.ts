import { createApp } from 'vue'
import { ElCard, ElButton, ElCollapseTransition } from 'element-plus'
import { THEME_KEY } from 'vue-echarts'
import Layout from '~/layout'

// for el-collapse-transition
import 'element-plus/lib/theme-chalk/base.css'
import 'element-plus/lib/theme-chalk/el-icon.css'
import 'element-plus/lib/theme-chalk/el-card.css'
import 'element-plus/lib/theme-chalk/el-button.css'

import './index.scss'

const app = createApp(Layout)

app.provide(THEME_KEY, 'light')

app.use(ElCard)
app.use(ElButton)
app.use(ElCollapseTransition)

app.mount('#app')
