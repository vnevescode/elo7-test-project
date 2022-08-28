<script>
    export let companyValues;
</script>

<style>

    .company-values-section{
        font-family: 'Roboto';
    }

    .company-values{
        display: flex;
        justify-content: center;
    }
    .company-values-container{       
        display: flex;
        flex-direction: row;
        justify-content: center;
        height: 400px;
        width: 960px;
        margin-top: 30px;
        border: 1px solid;
        
    }
    .company-values-container-column{
        display: flex;
        flex-direction: column;
        text-align: center;
        gap: 40px;
    }

    .company-values-container-column-title{
        font-size: 20px;
        font-weight: 500;
    }

    .company-values-container-column-text{
        text-align: justify;
        text-justify: inter-word;
        padding: 0px 50px;
    }

    .company-values-hr-div{
        text-align: center;
        display: flex;
        justify-content: center;        
    }

    .company-values-hr{
        width: 12%;         
        border: none;
        height: 4px;
        background: #d9d9d9;
        text-align: center;
    }

    .company-values-know-more{
        text-align: center;
        display: flex;
        justify-content: center; 
        margin-top: 20px;
        font-size: 25px;
        font-weight: 600;
        color: #359c9c;
    }

</style>

<section class="company-values-section">
    <div class="company-values">
        <div class="company-values-container">
            {#each companyValues as companyValue, index}
                <div class="company-values-container-column">
                    <div class="company-values-container-column-image">
                        <img src={companyValue.src} alt="Company Values image">
                    </div>
                    <div class="company-values-container-column-title">
                        <span>{companyValue.title}</span>
                    </div>
                    <div class="company-values-container-column-text">
                        <span>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam
                        </span>
                    </div>
                </div>        
            {/each}
        </div>
    </div>
    <div class="company-values-hr-div">
        <hr class="company-values-hr">
    </div>
    <div class="company-values-know-more">
        <span>SAIBA MAIS >></span>
    </div>
</section>       