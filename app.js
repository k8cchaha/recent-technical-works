import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import { works } from './data.js'

const app = createApp({
  data() {
    return {
      works: works || [],
      selectedFilter: ['job', 'side', 'practice', 'share'],
      filterList: [
        {
          name: 'In Need for Work',
          key: 'job',
          checked: true
        }, {
          name: 'Side Project',
          key: 'side',
          checked: true
        }, {
          name: 'Self Practice',
          key: 'practice',
          checked: true
        }, {
          name: 'Share',
          key: 'share',
          checked: true
        }, 
      ]
    }
  },
  computed: {
    displayWorks() {
      return this.works.filter((item)=>{
        return this.selectedFilter.includes(item.category)
      }) 
    },
    selectAll() {
      return this.selectedFilter.length === this.filterList.length
    }
  },
  methods: {
    checkAll() {
      if (this.selectedFilter.length === this.filterList.length) {
        this.selectedFilter = []
      } else {
        this.selectedFilter = []
        this.filterList.forEach(filter => {
          this.selectedFilter.push(filter.key)
        });
      }
    },
  }
}).mount('#app')