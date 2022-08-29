<script>

    export let openJobs;    
</script>

<style>
    .company-open-jobs-section{
        font-family: 'Roboto';
        display: flex;
        justify-content: center;
        color:#7d7873;
        margin-bottom: 100px;
        
    }

    .company-open-jobs-container{
       /*  border: 1px solid; */
        width: 960px;
        
        margin-top: 50px;
        padding: 0px 50px;
        display: flex;
        flex-direction: column;
    }
    .company-open-jobs-container-title{        
        text-align: center;
        font-size: 25px;
        font-weight: 600;
    }

    .company-open-jobs-container-subtitle{
        margin-top: 50px;
        font-size: 20px;
        font-weight: 600;
    }

    .company-open-jobs-container-jobs{
        margin-top: 30px;
        margin-bottom: 30px;
    }
    .company-open-jobs-container-job{
        display: flex;
        flex-direction: row;
        margin-top: 20px;
        margin-bottom: 20px;
        justify-content: space-between;
    }
    .job-title{
        flex:1;        
    }

    .job-title-span{
        color:#359c9c;
        font-weight: 600;
    }

</style>

<section class="company-open-jobs-section">
    <div class="company-open-jobs-container">
        <div class="company-open-jobs-container-title">
            <span>VAGAS EM ABERTO</span>
        </div>
        <div class="company-open-jobs-container-subtitle">
            <span>DESENVOLVIMENTO</span>
        </div>        
        {#if openJobs}        
            <div class="company-open-jobs-container-jobs"> 
                <!-- for each -->                     
                {#each openJobs as job, index}
                    {#if job.ativa === true}
                        <div class="company-open-jobs-container-job">
                            <div class="job-title">
                                <a href={job.link}>
                                    <span class="job-title-span">{job.cargo}</span>
                                </a>                        
                            </div>
                            <div class="job-address">
                                {#if job.localizacao}
                                    {#each Object.entries(job.localizacao) as [key, value], index (key)}
                                        {#if key == "bairro"}
                                            <span>{value} - </span>
                                        {:else if key == "cidade"}
                                            <span>{value}, </span>
                                        {:else}
                                            <span>{value}</span>
                                        {/if}
                                    {/each}
                                {:else}
                                    <span>Remoto</span>
                                {/if}                        
                            </div>
                        </div>
                    {/if}
                {/each} 
            </div>           
        {:else}
            <p>LOADING.....</p>
        {/if}   
    </div>
</section>