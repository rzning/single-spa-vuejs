const defaultOptions = {
    Vue: null,
    appOptions: null,
    instance: null
}

export default function singleSpaVue (customOptions) {
    if (typeof customOptions !== 'object') {
        throw new Error('single-spa-vuejs requires a configuration object')
    }
    const options = {
        ...defaultOptions,
        ...customOptions
    }
    if (!options.Vue) {
        throw new Error('single-spa-vuejs must be passed options.Vue')
    }
    if (!options.appOptions) {
        throw new Error('single-spa-vuejs must be passed options.appOptions')
    }
    const lifecycles = {
        bootstrap: bootstrap.bind(null, options),
        mount: mount.bind(null, options),
        unmount: unmount.bind(null, options),
        update: update.bind(null, options)
    }
    return lifecycles
}

function bootstrap (options) {
    return Promise.resolve()
}

function mount (options, props) {
    return Promise.resolve().then(() => {
        const { appOptions = {}, vuePlugins = [], ...otherProps } = props
        const instanceOptions = {
            ...options.appOptions,
            ...appOptions,
            data: {
                globalProps: {},
                ...(options.appOptions.data || {}),
                ...otherProps
            }
        }
        const Vue = options.Vue
        if (Array.isArray(vuePlugins)) {
            for (let plugin of vuePlugins) {
                if (Array.isArray(plugin)) {
                    Vue.use.apply(Vue, plugin)
                } else {
                    Vue.use(plugin)
                }
            }
        }
        options.instance = new Vue(instanceOptions)
    })
}

function unmount (options) {
    return new Promise((resolve) => {
        if (options.instance.$destroy) {
            const elem = options.instance.$el
            options.instance.$destroy()
            options.instance = null
            elem.innerHTML = ''
        }
        resolve()
    })
}

function update (options, props) {
    return new Promise((resolve) => {
        const instance = options.instance
        if (instance.$set && typeof props === 'object') {
            for (let name in props) {
                if (name in instance) {
                    instance[name] = props[name]
                } else {
                    instance.$set(instance.globalProps, name, props[name])
                }
            }
        }
        resolve()
    })
}
