let JStore = (function ({state, mutations, actions, getters}) {

    return function JStore(global) {
        let _store = {},
            _state = {};

        /**
         * 给 state 的所有属性设置 getter 方法，防止数据直接修改以及删除
         * @param state
         * @param obj
         */
        function normalizeMap(state, obj) {
            let keys = Object.keys(state);
            if (keys.length > 0) {
                keys.map(value => {
                    Object.defineProperty(obj, value, {
                        get() {
                            return state[value]
                        }
                    })
                })
            }
        }

        function equal(source, target) {
            return JSON.stringify(source) === JSON.stringify(target);
        }

        function install() {
            // 将 _store 注册到小程序 app 上
            global.$store = _store;

            // 初始化时，可能 state 中就有数据
            normalizeMap(state, _state);

            // 为 _store 添加 state 属性
            Object.defineProperty(_store, "state", {
                configurable: false,
                get() {
                    return _state;
                },
                set(v) {
                    _state = v;
                }
            });
        }

        install();

        /**
         * 分发一个事件
         * @param type
         * @param payload
         */
        _store.dispatch = function (type, payload) {
            let commit = this.commit;
            actions[type]({commit, state}, payload);
        };

        /**
         * 提交一个事件
         * @param type
         * @param payload
         */
        _store.commit = function (type, payload) {
            mutations[type](state, payload);
            let _ = {};
            normalizeMap(state, _);
            _state = _;
        };

        /**
         * 计算属性
         * @param arr
         */
        _store.getters = function (arr) {
            arr.map((item) => {
                // state 缓存
                let cacheState = {};
                Object.assign(cacheState, state);

                getters[item](state);

                if (!equal(cacheState, state)) {
                    let _ = {};
                    normalizeMap(state, _);
                    _state = _;
                    console.log(111);
                }
            });
        };

        /**
         * 根据属性名获取属性值，如果 context 存在就设置到当前 context 的 data 中
         * @param arr   属性名
         * @param context   小程序当前 page 的 this
         * @returns {*} 属性值
         */
        _store.getState = function (arr, context) {
            let res = {};
            if (context) {
                arr.map((key) => {
                    res[key] = _state[key];
                })
            }
            context.setData(res);
            return res;
        };

        // 防止 $store 上的属性被随意修改
        Object.defineProperties(_store, {
            dispatch: {
                configurable: false,
                writable: false
            },
            commit: {
                configurable: false,
                writable: false
            },
            getters: {
                configurable: false,
                writable: false
            },
            getState: {
                configurable: false,
                writable: false
            },

        })

    }
});

module.exports = JStore;
