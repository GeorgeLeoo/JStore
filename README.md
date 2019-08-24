# JStore
this is a state management pattern for wetchat mini app

# 微信小程序状态管理工具 JStore
闲着没事做，就想着给微信小程序写一个状态管理工具，名叫 JStore，这个状态管理工具是仿照 vuex 的几个方法来写的，所以有 vuex 的基础同学很容易理解。

Github:[https://github.com/GeorgeLeoo/JStore](https://github.com/GeorgeLeoo/JStore)

1. 安装
在小程序根目录下新建一个 store 文件，将 jstore.js 引入小程序项目。


2. 准备
在 store 中新建index.js, actions.js, mutations.js, mutation-types.js, getters.js, state.js

state.js：是一个状态管理对象，用来管理所有的状态, state中所有属性不能被直接删除或者修改，必须通过 dispatch 或 getter 方法
```
module.exports = {
    userInfo: {},
    arr:[2,4,6,8]
};
```

mutation-types.js：包含多个 mutation 的 type 名称的常量
```
export const SAVE_USER_INFO =  'save_user_info';
export const UPDATE_USER_INFO =  'UPDATE_USER_INFO';
export const SAVE_WEATHER =  'save_weather';
```

mutations.js: 直接更新 state 的多个方法的对象
```
const {SAVE_USER_INFO,SAVE_WEATHER} = require('./mutation-types');

module.exports = {
    [SAVE_USER_INFO](state, {userInfo}) {
        state.userInfo = userInfo;
    },
    [SAVE_WEATHER](state, {weatherinfo}) {
        state.weatherinfo = weatherinfo;
    }
};
```

actions.js: 通过 mutation 间接更新 state 对象
```
const {SAVE_USER_INFO, SAVE_WEATHER} = require('./mutation-types');

module.exports = {
    saveUserInfo({commit, state}, {userInfo}) {
        console.log(userInfo);
        commit(SAVE_USER_INFO, {userInfo})
    },
    saveWeather({commit, state}) {
        wx.request({
            url: 'http://www.weather.com.cn/data/sk/101010100.html',
            success(res) {
                console.log(res.data);
                let {weatherinfo} = res.data;
                commit(SAVE_WEATHER, {weatherinfo})
            }
        })
    }
};
```

getter.js：store 的计算属性, 只有当它的值发生了改变才会被重新计算。
```
module.exports = {
    addTen: state => {
        return state.arr = state.arr.map((val) => val * 10);
    }
};
```

index.js: vuex最核心的管理对象
```
const Jstore = require('./jstore');
const state = require('./state');
const mutations = require('./mutations');
const actions = require('./actions');
const getters = require('./getters');

module.exports = new Jstore({
    state,
    mutations,
    actions,
    getters
});
```

在 app.js 中引入 index.js
```
const store = require('./store/index.js');
```
然后在`app` 的`onLaunch()`方法中调用`store(this)`将 `store` 注册到小程序中，以后再 Page 中直接使用 `getApp().$store` 获取 store 对象，其中 this 指向的是 App 对象。

假设将获取微信账户数据添加到 state 中，可以在获取数据后，使用以下方法将
```
getApp().$store.dispatch("saveUserInfo", {userInfo: e.detail.userInfo});
```
结果就将userInfo数据保存到 state 中，然后可以在页面的任意地方调用这个数据
![](./shortcut/1.png)

dispatch有两个参数，第一个参数是 action 中定义的函数名，第二个参数是要保存的数据要传哪些参数给 action 中的方法，

比如获取天气数据：
在点击获取数据按钮时，执行以下这条语句
```
getApp().$store.dispatch("saveWeather");
```
结果：

![](./shortcut/2.png)
当state 中有数据后，取出数据使用 getState 方法
```
getApp().$store.getState(["userInfo", "weatherinfo"], this);
```
getState()方法有两个参数，第一个参数是一个数组，数组中存放的都是state 中的 key 的名称，而二个参数是当前页面的 this 指向，如果设置了 this，就会将数据保存到当前页面的 data 中

![](./shortcut/3.png)

# 微信小程序状态管理工具 JStore api
# API参考
## JStore
```
const store = new JStore({...options})
```

## JStore构造器选项
### state
* 类型：`object`
在 store 上注册 state, state 是一个状态管理对象，用来管理所有的状态

### mutations
* 类型：`{ [type: string]: Function }`
在 store 上注册 mutation，处理函数总是接受`state`作为第一个参数, `payload`作为第二个参数（可选）

### actions
* 类型：`{ [type: string]: Function }`
在 store 上注册 action。处理函数总是接受context作为第一个参数，payload作为第二个参数（可选）。
context对象包含以下属性：
```
{
  state,      // 等同于 `store.state`
  commit,     // 等同于 `store.commit`
}
```

### getters
* 类型：`{ [type: string]: Function }`
在 store 上注册 getter，getter 方法接受 state 参数

## JStore 实例属性
### state
* 类型：Object
根状态，只读，state 内部的第一层数据也是只读的

## JStore 实例方法
### commit
* commit(type: string, payload?: any)
提交 mutation。

### dispatch
* commit(type: string, payload?: any)
分发 action。

### getState
* commit(type: array, context?: object)
获取 state。
