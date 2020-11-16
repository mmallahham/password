import React from 'react'
import { Dimmer, Loader } from 'semantic-ui-react'

function Callback() {
  console.log('callback');
  
  return (
    <Dimmer active>
      <Loader content="Loading" />
    </Dimmer>
  )
}

export default Callback
