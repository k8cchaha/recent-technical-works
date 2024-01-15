<template>
  <div class="row items-center">
    <q-avatar>
      <img
        :src="formData.logo"
        v-if="formData.logo"
        class="company-logo"
      />
      <img
        src="~assets/icons/official-logo-with-bg.svg"
        v-else
        class="company-logo"
      />
    </q-avatar>
    <div class="upload-btn" @click="doUpload">
      Upload Avatar
    </div>
    <input
      type="file"
      accept=".png, .jpg, .jpeg"
      ref="input-upload"
      style="display: none"
      @change="handleFileChange"
    />
    <div class="upload-file-path">{{ filePath }}</div>
    <q-icon
      @click="uploadFile = null"
      v-show="uploadFile"
      size="20px"
      style="cursor: pointer"
    >
      <img src="~assets/icons/close.png" />
    </q-icon>
  </div>
  <div class="confirm-block">
    <div class="row justify-center">
      <q-btn
        outline
        color="primary"
        size="md"
        label="Cancel"
        style="margin-right: 10px"
        @click="doCancelInput"
      />
      <q-btn
        color="primary"
        unelevated
        size="md"
        label="OK"
        @click="updateOrganization('entity')"
      />
    </div>
  </div>
</template>

<script>
import { v4 as uuid } from "uuid";
import organizationApi from "src/libs/api/organizationApi";
import { client } from "src/libs/methods/apolloClient";

export default {
  name: "EntitySetting",
  data() {
    return {
      formData: {
        logo: null,
        // This portion of the code is omitted as it is irrelevant.
      },
      uploadFile: null,
    };
  },
  computed: {
    filePath() {
      if (this.uploadFile) {
        return this.uploadFile.name;
      }
      return "";
    },
  },
  methods: {
    getS3FilePath() {
      const orgId = this.team?.organizations?.id || "unknow";
      const hashId = uuid();
      return `org-${orgId}/logos/${hashId}`;
    },
    getUpdateDataByType(type) {
      const updateData = {};

      switch (type) {
        case "entity":
          updateData.logo = this.formData.logo;
          // This portion of the code is omitted as it is irrelevant.
          break;
        case "separateBilling":
          // This portion of the code is omitted as it is irrelevant.
          break;
        case "business":
          // This portion of the code is omitted as it is irrelevant.
          break;
        case "billing":
          // This portion of the code is omitted as it is irrelevant.
          break;
        default:
          alert("Unknown Type");
          break;
      }
      return updateData;
    },
    async updateOrganization(type) {
      try {
        if (this.uploadFile !== null) {
          const s3url = this.getS3FilePath();
          let res = await client().query({
            query: organizationApi.getPresignedUrl,
            variables: {
              objectKey: s3url,
            },
          });

          await fetch(res.data.getPresignedUrl, {
            method: "PUT",
            headers: { "Content-Type": "multipart/form-data" },
            body: this.uploadFile,
          });

          this.formData.logo = res?.data?.getPresignedUrl?.split("?")[0];
          this.uploadFile = null;
        }

        await client({
          successMsg: "Updated Successfully",
        }).mutate({
          mutation: organizationApi.updateOrganization,
          variables: {
            input: this.getUpdateDataByType(type),
          },
        });
      } catch (err) {
        console.log(JSON.stringify(err));
      }
    },
    handleFileChange(e) {
      this.uploadFile = e.target.files[0];
    }
  },
};
</script>

<style lang="scss" scoped>
// omitted
</style>
