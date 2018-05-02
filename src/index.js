import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Script from 'react-load-script'
import styled from 'styled-components'
import { lighten } from 'polished';

const Wrapper = styled.div`
  flex: 1;
  display: flex;
`

const propTypes = {
  style: PropTypes.object,
  clientId: PropTypes.string,
  clientSecret: PropTypes.string,
  uid: PropTypes.string,
  template: PropTypes.object,
  onSave: PropTypes.func,
  onSaveAsTemplate: PropTypes.func,
  onAutoSave: PropTypes.func,
  onSend: PropTypes.func,
  onLoad: PropTypes.func,
  onError: PropTypes.func
}

const t = 'https://raw.githubusercontent.com/BEE-Plugin/BEE-FREE-templates/master/v.2/BF-simple-template.json'

class BeePlugin extends Component {
  constructor(props) {
    super(props)

    this.beePluginReady = this.beePluginReady.bind(this)
    this.getToken = this.getToken.bind(this)
    this.getTemplate = this.getTemplate.bind(this)
  }

  render() {
    const style = this.props.style || {}

    return (
      <Wrapper>
        <Script
          url="https://app-rsrc.getbee.io/plugin/BeePlugin.js"
          onLoad={this.beePluginReady}
        />

        <div style={style} id="bee-plugin-container" />
      </Wrapper>
    )
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.template !== nextProps.template && this.plugin) {
      console.log('Loading new template')
      if (typeof nextProps.template === 'string') {
        template = JSON.parse(nextProps.template)
      } else {
        template = nextProps.template
      }
    }
  }

  async beePluginReady() {
    if (!window.BeePlugin || !window.BeePlugin.create) {
      console.warn('BeePlugin not initialized')
      return
    }

    const options = {
      container: 'bee-plugin-container', // [mandatory]
      onSave: (jsonFile, htmlFile) => { console.log(jsonFile, htmlFile) }, // [optional]
      onSaveAsTemplate: (jsonFile) => { console.log(jsonFile) }, // [optional]
      onAutoSave: (jsonFile) => { console.log(jsonFile) }, // [optional]
      onSend: (htmlFile) => { console.log(htmlFile) }, // [optional]
      onLoad: (jsonFile) => { console.log(jsonFile) }, // [optional]
      onError: (errorMessage) => { console.log(errorMessage) } // [optional]
    }

    const beeConfig = Object.assign({}, options, this.props)
    let template

    if (!this.props.template) {
      console.log('Initializing default template')
      template = await this.getTemplate(t)
    } else {
      if (typeof this.props.template === 'string') {
        template = JSON.parse(this.props.template)
      } else {
        template = this.props.template
      }
    }

    console.log(beeConfig)

    console.log('Initializing Bee Plugin')
    this.getToken(this.props.clientId, this.props.clientSecret)
      .then(resp => {
        console.log('Received Token')
        console.log('Creating plugin instance')
        
        
        window.BeePlugin.create(resp, beeConfig, (beePluginInstance) => { 
          this.plugin = beePluginInstance
          console.log('Created Bee Instance')
          this.plugin.start(template)
        })
      })
      .catch(err => {
        console.log('Error getting BEE token', err.message)
      })
  }

  getTemplate(url) {
    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    }

    return new Promise((resolve, reject) => {
      fetch(url, options)
        .then(res => res.json())
        .then(json => {
          resolve(json)
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  getToken(clientId, clientSecret) {
    const formBody = []
    formBody.push(`${encodeURIComponent('grant_type')}=${encodeURIComponent('password')}`)
    formBody.push(`${encodeURIComponent('client_id')}=${encodeURIComponent(clientId)}`)
    formBody.push(`${encodeURIComponent('client_secret')}=${encodeURIComponent(clientSecret)}`)

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody.join('&')
    }

    const url = 'https://auth.getbee.io/apiauth'

    return new Promise((resolve, reject) => {
      fetch(url, options)
        .then(res => res.json())
        .then(json => {
          resolve(json)
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}

BeePlugin.propTypes = propTypes

export default BeePlugin
