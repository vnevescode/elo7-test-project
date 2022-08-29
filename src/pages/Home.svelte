<script>

    import { onMount } from 'svelte';
    import CeoWords from '../components/CeoWords.svelte';
    import CompanyOpenJobs from '../components/CompanyOpenJobs.svelte';
    import CompanyPhoto from '../components/CompanyPhoto.svelte';
    import CompanyValues from '../components/CompanyValues.svelte';
    import HeroSection from '../components/HeroSection.svelte';
    import MainSubTitle from '../components/MainSubTitle.svelte';
    import MeetOurTeam from '../components/MeetOurTeam.svelte';
    


    let heroSectionPhoto = {
        src:"assets/foto-header.png"
    }
    let members = [
        { src:"assets/camila.png"},
        { src:"assets/guto.png"},
        { src:"assets/david.png"},
        { src:"assets/beatriz.png"}
    ]

    let membersNames = [
        'Beatriz','Guto','David','Camila'
    ]

    let companyValues = [
        { src:"assets/qualidade.png", title:"Qualidade de Vida" },
        { src:"assets/descontracao.png", title:"Ambiente Descontraído" },
        { src:"assets/atividades.png", title:"Atividades Extras" }
    ]

    let companyPhoto = { src:"assets/foto-bottom.png"}

    let openJobs;

    onMount( async () => {        
        const response = await fetch('http://www.mocky.io/v2/5d6fb6b1310000f89166087b');
        const data = await response.json();
        openJobs = data.vagas;
    })
    
</script>

<style>  

</style>

<HeroSection  heroSectionPhoto={ heroSectionPhoto}/>
<MainSubTitle/>
<CeoWords/>
<MeetOurTeam  members={members} membersNames={membersNames}/>
<CompanyValues companyValues={companyValues}/>
<CompanyPhoto companyPhoto={companyPhoto}/>
<CompanyOpenJobs openJobs={openJobs}/>

