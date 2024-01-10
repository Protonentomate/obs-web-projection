<script>
  import { onMount, onDestroy } from 'svelte'
  import { obs, sendCommand } from './obs.js'
   

  export let imageFormat = 'jpg'
  const apiURL =
    "http://localhost:4000/vorlagen";

  let programScene = ''
  let previewScene = ''

  let templates = []

  let preview_linkslinks = {}
  let preview_linksrechts = {}
  let preview_rechtslinks  = {}
  let preview_rechtsrechts = {}
  let preview = {}
  let screenshotInterval
  let transitions = []
  // let currentTransition = ''




  onMount(async () => {
    let data
    if (!programScene) {
      data = await sendCommand('GetCurrentProgramScene')
      programScene = data.currentProgramSceneName || ''
    }
    

    data = await sendCommand('GetSceneTransitionList')
    console.log('GetSceneTransitionList', data)
    transitions = data.transitions || []
    // currentTransition = data.currentSceneTransitionName || ''
    screenshotInterval = setInterval(getScreenshot, 1000)
  })

  onDestroy(() => {
    clearInterval(screenshotInterval)
  })

  // eslint-disable-next-line
  $: getScreenshot(), programScene, previewScene


  obs.on('CurrentPreviewSceneChanged', async (data) => {
    console.log('CurrentPreviewSceneChanged', data.sceneName)
    previewScene = data.sceneName
  })

  obs.on('CurrentProgramSceneChanged', async (data) => {
    console.log('CurrentProgramSceneChanged', data.sceneName)
    programScene = data.sceneName
  })

  obs.on('SceneNameChanged', async (data) => {
    if (data.oldSceneName === programScene) programScene = data.sceneName
    if (data.oldSceneName === previewScene) previewScene = data.sceneName
  })

  // TODO: does not exist???
  obs.on('TransitionListChanged', async (data) => {
    console.log('TransitionListChanged', data)
    transitions = data.transitions || []
  })

  async function getScreenshot () {
    if (!programScene) return
    let data
    //////////////////////////////////////////////////////////////////////
    data = await sendCommand('GetSourceScreenshot', {
      sourceName: "LinksLinks",
      imageFormat,
      imageWidth: 1080,
      imageHeight: 1920
    })
    if (data && data.imageData) {
      preview_linkslinks.src = data.imageData
    }
    data = await sendCommand('GetSourceScreenshot', {
      sourceName: "LinksRechts",
      imageFormat,
      imageWidth: 1080,
      imageHeight: 1920
    })
    if (data && data.imageData) {
      preview_linksrechts.src = data.imageData
    }
    data = await sendCommand('GetSourceScreenshot', {
      sourceName: "RechtsLinks",
      imageFormat,
      imageWidth: 1080,
      imageHeight: 1920
    })
    if (data && data.imageData) {
      preview_rechtslinks.src = data.imageData
    }
    data = await sendCommand('GetSourceScreenshot', {
      sourceName: "RechtsRechts",
      imageFormat,
      imageWidth: 1080,
      imageHeight: 1920
    })
    if (data && data.imageData) {
      preview_rechtsrechts.src = data.imageData
    }

    /////////////////////////////////////////////////////////////////////
}

  async function getDataFromApi() {
    console.log("API CALL")
    const api = await fetch(apiURL);
    templates = await api.json();
    console.log(templates)
    //console.log(recordsObject)
  }

  getDataFromApi();

  export function handleDrop(ev) {
    console.log("onDrop");
    console.log(ev)
  }
  export function handleDragover(event) {
        console.log("onDragOver");
    }

  function changeScreen(target) {
    console.log(target.currentTarget.getAttribute('data-url'))
    sendCommand("SetInputSettings",{"inputName":target.currentTarget.getAttribute('data-target'),"inputSettings":{"file":target.currentTarget.getAttribute('data-url')}})
  }

  function changeAllScreens(target) {
    sendCommand("SetInputSettings",{"inputName":"LinksLinks","inputSettings":{"file":target.currentTarget.getAttribute('data-urlLinksLinks')}})
    sendCommand("SetInputSettings",{"inputName":"LinksRechts","inputSettings":{"file":target.currentTarget.getAttribute('data-urlLinksRechts')}})
    sendCommand("SetInputSettings",{"inputName":"RechtsLinks","inputSettings":{"file":target.currentTarget.getAttribute('data-urlRechtsLinks')}})
    sendCommand("SetInputSettings",{"inputName":"RechtsRechts","inputSettings":{"file":target.currentTarget.getAttribute('data-urlRechtsRechts')}})
  }

</script>



<div class="columns is-centered is-vcentered has-text-centered">
  <div class="column" >
    LinksLinks
    <img  on:drop|preventDefault={handleDrop} 
    on:dragover|preventDefault={handleDragover}  bind:this={preview_linkslinks}  style="border-style: dotted;border-color:red;" alt="Program"/>
  </div>
  <div class="column">
    Links Rechts
    <img bind:this={preview_linksrechts} style="border-style: dotted;border-color:red;" alt="Program"/>
  </div>
  <div class="column">
    RechtsLinks
    <img bind:this={preview_rechtslinks}  style="border-style: dotted;border-color:red;" alt="Program"/>
  </div>
  <div class="column">
    RechtsRechts
    <img bind:this={preview_rechtsrechts}  style="border-style: dotted;border-color:red;" alt="Program"/>
  </div>
</div>



<div class="columns is-centered is-vcentered has-text-centered">
  <div class="column">
   Templates:
    {#each templates as template}
    {template.Name}
    <br>
    <div class="columns is-centered is-vcentered has-text-centered">
      <div class="column">
        LinksLinks
        <img src={template.LinksLinks.URL}  style="border-style: dotted;" alt="Program"/>
        <button data-url={template.LinksLinks.LocalURL} data-target="LinksLinks" on:click={changeScreen}>Aktivieren</button>
      </div>
      <div class="column">
        LinksRechts
        <img src={template.LinksRechts.URL} style="border-style: dotted;" alt="Program"/>
        <button data-url={template.LinksRechts.LocalURL} data-target="LinksRechts" on:click={changeScreen}>Aktivieren</button>
      </div>
      <div class="column">
        RechtsLinks
        <img src={template.RechtsLinks.URL} style="border-style: dotted;" alt="Program"/>
        <button data-url={template.RechtsLinks.LocalURL} data-target="RechtsLinks" on:click={changeScreen}>Aktivieren</button>
      </div>
      <div class="column">
        RechtsRechts
        <img src={template.RechtsRechts.URL} style="border-style: dotted;" alt="Program"/>
        <button data-url={template.RechtsRechts.LocalURL} data-target="RechtsRechts" on:click={changeScreen}>Aktivieren</button>
      </div>
      <div class="column">
        Set Aktivieren
        <button data-urlLinksLinks={template.LinksLinks.LocalURL} data-urlLinksRechts={template.LinksRechts.LocalURL} data-urlRechtsLinks={template.RechtsLinks.LocalURL} data-urlRechtsRechts={template.RechtsRechts.LocalURL}  on:click={changeAllScreens}>Set Aktivieren</button>
      </div>
    </div>
    {/each}

  </div>
</div>
