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
        throw new Error('single-spa-vuejs must be passed opts.appOptions')
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
        const { vueOptions = {}, vuePlugins = [], ...otherProps } = props
        const appOptions = {
            ...options.appOptions,
            ...vueOptions,
            data: {
                ...(options.appOptions.data || {}),
                ...otherProps
            }
        }
        if (Array.isArray(vuePlugins)) {
            for (let plugin of vuePlugins) {
                options.Vue.use(plugin)
            }
        }
        options.instance = new options.Vue(appOptions)
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
                instance.$set(instance, name, props[name])
            }
        }
        resolve()
    })
}
