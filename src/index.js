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

async function mount (options, props) {
    const { appOptions = {}, vuePlugins = [], ...otherProps } = props
    const instanceOptions = {
        ...options.appOptions,
        ...appOptions
    }
    instanceOptions.data = {
        // globalProps is used to store the new reactive data in the update method
        globalProps: {},
        ...(instanceOptions.data || {}),
        ...otherProps
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
}

async function unmount (options) {
    if (options.instance.$destroy) {
        const elem = options.instance.$el
        options.instance.$destroy()
        options.instance = null
        elem.innerHTML = ''
    }
}

async function update (options, props) {
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
}
