<template>
    <div class="business-page">
        <!-- Business Info -->
        <div class="hero bus-page-top">
            <div class="hero-body">
                <div class="container">
                    <div class="service-categories is-spaced">
                            <span class="search-tag tag is-dark is-small" v-for="category in categories"
                                  :key="category._id">{{ category.title }}</span>
                    </div>
                    <div class="title is-2 white"> {{ name }} </div>

                    <div class="subtitle white">{{ shortDescription }}</div>

                    <div class="subtitle white is-marginless">
                        <span><i class="icon is-medium fa fa-envelope" style="padding-top: 0.25em"></i></span>
                        {{ email }}

                    </div>
                    <div class="subtitle white is-marginless">
                        <span><i class="icon is-medium fa fa-phone" style="padding-top: 0.25em"></i></span>
                        <span v-for="num in phoneNumbers">{{ num }} </span>
                    </div>
                    <div class="workinghours">
                        <div class="subtitle white is-marginless">
                            <span><i class="icon is-medium fa fa-clock-o" style="padding-top: 0.25em"></i></span>
                            Working Hours

                        </div>
                        <pre class="subtitle white" style="padding-left: 1.9em">{{ workingHours }}</pre>
                    </div>

                </div>
            </div>
        </div>

        <!-- Business Description -->
        <div class="columns">
            <!-- Left Pane -->
            <div class="column is-7 is-offset-1">

                <!-- Business Full Description -->
                <div class="box">
                    <pre class="content is-marginless">{{ description || "No Description."}}</pre>
                </div>

                <!-- Navigation tabs -->
                <div class="tabs">
                    <ul>
                        <li @click="active = 1" :class="{ 'is-active': (active === 1) }"><a>Services</a></li>
                        <li @click="active = 2" :class="{ 'is-active': (active === 2) }"><a>Gallery</a></li>
                        <li @click="active = 3" :class="{ 'is-active': (active === 3) }"><a>Branches</a></li>
                    </ul>
                </div>

                <!-- Gallery Tab -->
                    <transition name="fade">
                        <div class="no-gallery" v-show="active === 2" v-if="gallery.length === 0">
                            <h3 class="title has-text-centered">
                                No Gallery found.
                            </h3>
                        </div>
                        <div class="gallery" v-if="gallery.length > 0" v-show="active === 2">
                            <el-carousel :interval="1000" arrow="always">
                                <el-carousel-item v-for="item in gallery" v-bind:data="item" v-bind:key="item">
                                    <img :src="'uploads/' + item.path" class="extended"/>
                                </el-carousel-item>
                            </el-carousel>
                        </div>
                    </transition>

                <!-- Branches Tab -->
                    <transition name="fade">
                        <div class="branches" v-show="active === 3">
                            <div class="box" v-for="branch in branches">
                                <div class="content branches">
                                    <div class="branch">
                                        <h4> {{ branch.location }} </h4>
                                        <h6>
                                            <span><i class=" icon fa fa-location-arrow"></i></span>
                                            {{ branch.address }}
                                        </h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </transition>

                <!-- Services Tab -->
                <transition name="fade">
                    <div class="no-services" v-show="active === 1" v-if="services.length === 0">
                        <h3 class="title has-text-centered">
                            No Services found.
                        </h3>
                    </div>
                    <div class="services" v-show="active === 1" v-if="services.length > 0">
                        <router-link :to="`/service/${service._id}`" class="service-search-result box"
                                     v-for="service in services" :key="service._id">
                            <div class="content services">
                                <div class="service">
                                    <h4> {{ service.name }} </h4>
                                    <h6>
                                        <span><i class=" icon fa fa-edit"></i></span>
                                        {{ service.shortDescription }}
                                    </h6>
                                    <el-rate class="rating-search" :value="service._avgRating"
                                             disabled :max="5">
                                    </el-rate>
                                </div>
                            </div>
                        </router-link>
                    </div>
                </transition>
            </div>

            <!-- Right Pane -->
            <div class="column is-3">
                <!-- Related -->
                <div class="panel">
                    <p class="panel-heading"> Related Businesses </p>
                    <a class="dark-link panel-block"
                       @click.prevent="relatedView(bus._id)"
                       v-for="bus in related"
                       :key="bus._id"
                       :href="`/business/${bus._id}`">
                        <p>
                            {{ bus.name }}
                        </p>
                    </a>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
  import axios from 'axios';
  import { Visitor } from '../../../services/EndPoints';

  export default {
    data() {
      return {
        id: '',
        name: '',
        active: 1,
        email: '',
        loader: '',
        shortDescription: '',
        gallery: [],
        phoneNumbers: [],
        description: '',
        workingHours: '',
        categories: [],
        branches: [],
        services: [],
        related: [],
      };
    },
    mounted() {
      this.load(this.$route.params.id);
    },

    methods: {
      viewService(service) {
        const serviceID = service._id;
        const url = `/service/${serviceID}`;
        this.$router.push(url);
      },
      bookService(service) {
        const serviceID = service._id;
        const url = `/service/${serviceID}/book`;
        this.$router.push(url);
      },
      relatedView(id) {
        const url = `/business/${id}`;
        this.$router.push(url);
        this.load(id);
      },
      load(id) {
        this.loader = this.$loading({
          fullscreen: true,
        });
        axios.get(Visitor().viewBusiness(id))
            .then((business) => {
              this.id = business.data.id;
              this.name = business.data.name;
              this.email = business.data.email;
              this.shortDescription = business.data.shortDescription;
              this.gallery = business.data.gallery;
              this.phoneNumbers = business.data.phoneNumbers;
              this.description = business.data.description;
              this.workingHours = business.data.workingHours;
              this.categories = business.data.categories;
              this.branches = business.data.branches;
              this.services = business.data.services;

              axios.get(Visitor().relatedBusiness(this.categories[0]._id, 1))
                  .then((res) => {
                    this.loader.close();
                    this.related = res.data.results;
                    this.related = this.related
                        .filter(bus => bus._id !== this.$route.params.id);
                  })
                  .catch(() => {
                    this.loader.close();
                    this.$router.push('/404');
                  });
            })
            .catch(() => {
              this.loader.close();
              this.$router.push('/404');
            });
      },
    },
  };
</script>

<style>
    .bus-page-top {
        background: #cb2d3e;  /* fallback for old browsers */
        background: -webkit-linear-gradient(to right, #ef473a, #cb2d3e);  /* Chrome 10-25, Safari 5.1-6 */
        background: linear-gradient(to right, #ef473a, #cb2d3e); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
        margin-bottom: 2em;
    }

    pre {
        background: transparent;
        font: inherit;
        white-space:pre-wrap;
        word-wrap:break-word;
    }

    a.box:hover, a.box:focus{
        box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px #eee;
    }
</style>