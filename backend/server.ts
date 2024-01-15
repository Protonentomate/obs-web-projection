const sharp = require('sharp');
import fs from 'fs';
import path from 'path';
var VorlageOrdner = "/Users/ncsc_brian/Pictures/projektion/src/";
var EinzelOrdner = "/Users/ncsc_brian/Pictures/projektion/src/";
var PublicURL = "http://localhost:4000/public/";




const server = Bun.serve({
  port: 4000,
  async fetch(req) {
    const url = new URL(req.url);

    // return index.html for root path
    if (url.pathname === "/")
      return new Response(Bun.file("index.html"), {
        headers: {
          "Content-Type": "text/html",
        },
      });

    // parse formdata at /action
    if (url.pathname === '/action') {
      const formdata = await req.formData();
      const name = formdata.get('name');
      const profilePicture = formdata.get('profilePicture');
      if (!profilePicture) throw new Error('Must upload a profile picture.');
      // write profilePicture to disk
      const buf = await profilePicture.arrayBuffer();
      await Bun.write('profilePicture.png', profilePicture);
      sharp(buf).resize(1080, 1920,{fit: "fill"}).toFile('output.jpg');
      return new Response("Success");
    }


    //Get Templates
    if (url.pathname === '/vorlagen') {
      var templates = [];
      const files = fs.readdirSync(VorlageOrdner, { withFileTypes: true });
      for (const file of files) {
        if (file.isDirectory()) {
          console.log(file)

          var templeateObj={"Name":file.name}

          var filearr = [];
          const images = fs.readdirSync(VorlageOrdner+file.name, { withFileTypes: true });
            for (const image of images) {

              if(image.name==="LinksLinks.jpg"){
                console.log(image)
                templeateObj['LinksLinks']={"Filename":image.name,"URL":PublicURL+file.name+"/"+image.name,"LocalURL":VorlageOrdner+file.name+"/"+image.name};
              }
              else if(image.name==="LinksRechts.jpg"){
                console.log(image)
                templeateObj['LinksRechts']={"Filename":image.name,"URL":PublicURL+file.name+"/"+image.name,"LocalURL":VorlageOrdner+file.name+"/"+image.name};
              }
              else if(image.name==="RechtsLinks.jpg"){
                console.log(image)
                templeateObj['RechtsLinks']={"Filename":image.name,"URL":PublicURL+file.name+"/"+image.name,"LocalURL":VorlageOrdner+file.name+"/"+image.name};
              }
              else if(image.name==="RechtsRechts.jpg"){
                console.log(image)
                templeateObj['RechtsRechts']={"Filename":image.name,"URL":PublicURL+file.name+"/"+image.name,"LocalURL":VorlageOrdner+file.name+"/"+image.name};
              }


              //if(!image.name.startsWith(".")){
              //  console.log(image)
              //  filearr.push({"Filename":image.name,"URL":PublicURL+file.name+"/"+image.name,"LocalURL":VorlageOrdner+file.name+"/"+image.name});
              //}
              
            }

          
          templates.push(templeateObj)
        }
      }
      var res = new Response(JSON.stringify(templates));
      res.headers.set('Access-Control-Allow-Origin', '*');
      res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.headers.set('Content-Type', 'application/json');
      return res;
    }

    //Get Templates
    if (url.pathname === '/einzelbilder') {
      var einzelbilder = [];
      const einzelfiles = fs.readdirSync(EinzelOrdner, { withFileTypes: true });
      for (const file of einzelfiles) {

        if (!file.isDirectory() && file.name.endsWith(".jpg")) {
          console.log(file)

          var templeateObj={
            "Filename":file.name,
            "URL":PublicURL+file.name,
            "LocalURL":EinzelOrdner+file.name
          }
          einzelbilder.push(templeateObj)
        }
      }
      var res = new Response(JSON.stringify(einzelbilder));
      res.headers.set('Access-Control-Allow-Origin', '*');
      res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.headers.set('Content-Type', 'application/json');
      return res;
    }




    //Serve Folder
    if (url.pathname.startsWith("/public/")) {
      const path = VorlageOrdner+decodeURI(new URL(req.url).pathname).substring(8);
      console.log(path)
      const file = Bun.file(path);
      return new Response(file);
    }



    
    
    return new Response("Not Found", { status: 404 });
  },
});