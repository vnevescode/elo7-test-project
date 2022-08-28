<script>
    import { onMount } from 'svelte';
    import CeoWords from "./components/CeoWords.svelte";
    import CompanyOpenJobs from "./components/CompanyOpenJobs.svelte";
    import CompanyPhoto from "./components/CompanyPhoto.svelte";
    import CompanyValues from "./components/CompanyValues.svelte";
    import MainSubTitle from "./components/MainSubTitle.svelte";
    import MeetOurTeam from "./components/MeetOurTeam.svelte";
    import Home from "./pages/Home.svelte";

    let members = [
        { src:"assets/camila.png"},
        { src:"assets/guto.png"},
        { src:"assets/david.png"},
        { src:"assets/beatriz.png"}
    ]

    let companyValues = [
        { src:"assets/qualidade.png", title:"Qualidade de Vida" },
        { src:"assets/descontracao.png", title:"Ambiente Descontraído" },
        { src:"assets/atividades.png", title:"Atividades Extras" }
    ]

    let companyPhoto = { src:"assets/foto-bottom.png"}

    let openJobs;

    onMount( async () => {
        /* openJobs = await fetch('http://www.mocky.io/v2/5d6fb6b1310000f89166087b')
            .then( res => res.json()); */
        const response = await fetch('http://www.mocky.io/v2/5d6fb6b1310000f89166087b');
        const data = await response.json();
        openJobs = data.vagas;
    })

    

</script>

<style>
            
</style>

<Home/>
<MainSubTitle/>
<CeoWords/>
<MeetOurTeam  members={members}/>
<CompanyValues companyValues={companyValues}/>
<CompanyPhoto companyPhoto={companyPhoto}/>
<CompanyOpenJobs openJobs={openJobs}/>


<!-- 
<pre>
	{JSON.stringify(openJobs, null, 2)}
</pre>

<h1>Olaaaaaaaaaaaaaaaa</h1>
<h1>Olaaaaaaaaaaaaaaaa</h1>
<h1>Olaaaaaaaaaaaaaaaa</h1>
<h1>Olaaaaaaaaaaaaaaaa</h1> -->