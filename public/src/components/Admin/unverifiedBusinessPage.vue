<template>
  <div class="confirm-business-table">
  
    <div v-if="errors.length>0">
      <div class="error" v-for="(error,idx) in errors">
        <el-alert @close="closeError(idx)" :title="error" type="error" show-icon></el-alert>
      </div>
    </div>
  
    <b-table
                v-if="businessData.length > 0"
                :data="businessData"
                :striped="true"
                :narrowed="false"
                :mobile-cards="true"
                :paginated="true"
                :per-page="10"
                :pagination-simple="false"
                default-sort="name"
                render-html>  
                
      <b-table-column field="name" label="Name" sortable></b-table-column>
      <b-table-column field="email" label="Email" sortable></b-table-column>
      <b-table-column field="phoneNumbers" label="Phone Numbers" :format="getPhones"></b-table-column>
      <b-table-column field="_id" component="accept-btn"></b-table-column>
      <b-table-column field="_id" component="reject-btn"></b-table-column>
    </b-table>
  
    <!-- No data found. -->
    <div class="no-data hero" v-show="businessData.length === 0">
      <div class="hero-body has-text-centered">
        <el-icon name="circle-check" class="confirmation-icon"></el-icon>
        <p class="title is-2">No pending businesses.</p>
        <a class="button is-info" @click.prevent="fetchBusiness">Refresh</a>
      </div>
    </div>
  
  </div>
</template>

<script>
  /**
   * This component is used to allow an Admin to Accept or Rejecta Business.
   */
  import axios from 'axios';
  import { Admin } from '../../services/EndPoints';
  import adminAuth from '../../services/auth/adminAuth';
  import EventBus from '../../services/EventBus';
  
  export default {
    /**
     * Data used by this component.
     * errors: Errors received from the server.
     * businessData: Businesses fetched from the server.
     */
    data() {
      return {
        errors: [],
        businessData: [],
      };
    },
    /**
     * Ran when mounted.
     * Fetch all business and attach relevant listeners.
     */
    mounted() {
      this.fetchBusiness();
      EventBus.$on('BusinessConfirmed', () => {
        this.fetchBusiness();
      });
    },
    /**
     * Methods used by this component.
     */
    methods: {
      /**
       * Close an error.
       */
      closeError(idx) {
        this.errors.splice(idx, 1);
      },
      /**
       * Formate phone numbers of a business.
       */
      getPhones(value, row) {
        let res = '';
        value.forEach((number) => {
          res += `${number} <br />`;
        });
        return res;
      },
      /**
       * Fetch all Unverified Businesses from the server.
       */
      fetchBusiness() {
        const loader = this.$loading({
          fullscreen: true,
        });
  
        axios.post(Admin().viewBusiness, {}, {
          headers: {
            Authorization: adminAuth.getJWTtoken(),
          },
        })
          .then((res) => {
            this.businessData = res.data;
            this.errors = [];
            loader.close();
          })
          .catch((err) => {
            this.errors = err.response.data.errors;
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
            loader.close();
          });
      },
    },
  };
</script>
