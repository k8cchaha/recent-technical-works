<template>
  <div v-show="isModalOpen" class="popup-wrap" :class="{ active: isModalOpen }">
    <div class="popup-box">
      <iframe class="fullscreen-iframe" :src="KYCUrl" @load="iframeLoaded" />
      <a v-if="isIframeLoaded" class="popup-close" @click="closeIframe" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      KYCUrl: null,
      KYCreleaseCode: 'xxxxxxxxxxxxxxxxx',
      isModalOpen: false,
      isIframeLoaded: false,
      currentType: null
    }
  },
  computed: {
    memberInfo() {
      return this.$store.state.user.memberInfo
    },
  },
  methods: {
    setKYCUrl(type) {
      this.currentType = type
      this.isIframeLoaded = false
      this.KYCUrl = ''
      this.KYCUrl = `https://script.google.com/${KYCreleaseCode}?brand=${this.memberInfo.brand_id}&promotion=${this.memberInfo.promotion_code}&type=${type}&lang=${this.$store.state.user.language}`
      this.isModalOpen = true
    },
    
    shouldHide(type) {
      const existingTypes = JSON.parse(localStorage.getItem('kycTypes') || '[]')
      const typeExists = existingTypes.some(item => item.type === type)
      return this.memberInfo.is_pass_KYC === 2 && typeExists || this.memberInfo.is_pass_KYC === 1
    },
    iframeLoaded() {
      this.isIframeLoaded = true
    },
    closeIframe() {
      this.isModalOpen = false
      window.location.reload()
    }
  }
}
</script>

<style lang="scss" scoped>
// omitted
</style>
