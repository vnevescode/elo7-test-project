<script>

</script>

<style>
    .mainsubtitle-section{
        height: 220px;
        background-color: #fff;
        display: flex;
        justify-content: center;
        word-wrap: break-word;
        text-overflow: ellipsis;
        overflow:hidden;
        
    }

    .info-container{       
        word-wrap: break-word; 
        width: 960px;
        /* border: 1px solid black;  */       
        
    }

    .info-container_info{
        padding-top: 50px;
        font-family: 'Roboto';
        font-size: 18px;
        color: #7d7873;
        box-sizing:border-box;
        margin: 0px 50px;        
        
    }

    .info-container_horizontal_rule{        
        width: 25%;
        margin: 20px auto; 
        border: none;
        height: 4px;
        background: #d9d9d9;
             
    }

    .info-container_open_jobs{
        
        margin: auto; 
        text-align: center;

        font-family: 'Roboto';
        font-size: 21px;
        font-weight: 600;
        color: #359c9c;
    }

    /* smartphone */
    @media only screen and (max-width: 767px) {
        .info-container_info{
            padding-top: 30px;
            font-size: 16px;
        }

        .info-container_horizontal_rule{
            margin: 10px auto; 
        }
    }
</style>

<section class="mainsubtitle-section">
    <div class="info-container">
        <div class="info-container_info">
            <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam Lorem ipsum dolor sit amet. 
            </span>
        </div>
        <div class="info-container_horizontal_rule">
            <hr>
        </div>
        <div class="info-container_open_jobs">
            <span>VAGAS EM ABERTO >></span>
        </div>
    </div>
</section>