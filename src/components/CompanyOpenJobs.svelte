<script>

    export let openJobs;    
</script>

<style>
    .company-open-jobs-section{
        font-family: 'Roboto';
        display: flex;
        justify-content: center;
        
    }

    .company-open-jobs-container{
        border: 1px solid;
        width: 960px;
        
        margin-top: 50px;
        padding: 0px 50px;
        border: 1px solid;
        display: flex;
        flex-direction: column;
    }
    .company-open-jobs-container-title{
        background-color: tomato;
        text-align: center;
        font-size: 25px;
        font-weight: 600;
    }

    .company-open-jobs-container-subtitle{
        background-color: tomato;
        margin-top: 50px;
        font-size: 20px;
        font-weight: 600;
    }
    .company-open-jobs-container-job{
        display: flex;
        flex-direction: row;
        margin-top: 50px;
    }
    .job-title{
        flex:1;
    }

    .job-address{
        flex:1;
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
        <!-- for -->
            {#each openJobs as job, index}
                <div class="company-open-jobs-container-job">
                    <div class="job-title">
                        <p>{job.cargo}</p>
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
                        {/if}                        
                    </div>
                </div> 
            {/each}            
        {:else}
            <p>LOADING.....</p>
        {/if}   
    </div>
</section>