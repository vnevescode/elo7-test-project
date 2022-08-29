<script>
    import 'animate.css';
    export let heroSectionPhoto;  
</script>

<style>    
    .darkness{
        background: rgba(0, 0, 0, 0.25);
        width:100%;
        height: 675px;
        
    } 
    
    .full-screen-width{        
        background-image: url('/assets/foto-header.png');
        background-size: cover;
        background-position: center;
        
    }

    .main-text-container{
        display: flex;
        align-items: center;
        justify-content: center;
        height: 900px;
    } 

    .main-text{     
        font-family: 'Roboto';
        font-style: normal;
        font-weight: 600;
        font-size: 75px;
        line-height: 80px;
        color: #FFFFFF;        
        text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);   

        /* animation */
        animation: fadeIn; 
        animation-duration: 3s;
        
        
    }

    /* tablet  */
    @media screen and (max-width: 1024px) {
        .darkness{
            height: 540px;
            
        }
        .main-text-container{
            height: 720px;
        }
        
    }

    /* smartphone */
    @media screen and (max-width: 767px) {
        .darkness{
            height: 432px;
            
        }
        .main-text-container{
            height: 576px;
        }

        .main-text{
            font-size: 40px;
        }
        
    }



    

</style>


<section class="section team-image-section">
    <div class="full-screen-width">
        <div class="darkness">
            <div class="main-text-container">
                <p class="main-text">Trabalhe no Elo7</p>
            </div>
        </div>        
    </div> 
    
    <!-- <div class="parent-div">
        <div id="example-div">HELLO</div>
    </div> -->
</section>