# single-spa-vuejs
a [single-spa] plugin for [Vue] applications

## Install

```sh
npm install single-spa-vuejs --save
# or
yarn add single-spa-vuejs
```

## Usage

```js
import Vue from 'vue'
import singleSpaVue from 'single-spa-vuejs'

const vueLifecycles = singleSpaVue({
    Vue,
    appOptions: {
        el: `#app`,
        data () {
            return { content: 'hello single-spa' }
        },
        render: h => h('div', this.content)
    }
})

export const bootstrap = [
    vueLifecycles.bootstrap
]
export function mount(props) {
    return vueLifecycles.mount(props)
}
export const unmount = [
    vueLifecycles.unmount
]
```

## License

[MIT](http://opensource.org/licenses/MIT)

[single-spa]: <https://single-spa.js.org/>
[Vue]: <https://vuejs.org/>
