<script></script>

<style>
    .ceo-words{
        background-color: #f8f8f8  ;     
        display: flex;
        justify-content: center;        
    }
    .ceo-words-container{  
        display: flex;        
        width: 960px;
        /* border: 1px solid black; */
        
    }
    .ceo-words-photo{
        margin: 50px;
        background-size: cover;
        background-position: center;        
        flex:1;        
    }

    .ceo-words-photo > img{
        
    }

    .ceo-words-info{        
        flex:1;
        /* margin-left: 70px; */
    }
    .ceo-words-info-container{        
        font-family: 'Roboto';
        margin: 50px 0px;
    }
    .ceo-words-info-title{        
        font-size: 21px;
        font-weight: 600;
        color: #7d7873;
    }

    .ceo-words-info-subtitle{
        margin: 5px 0px;
        font-size: 18px;
        font-weight: 600;
        color: #f9ae22;
    }
    .ceo-words-info-text{  
        margin-top: 30px;      
        margin-right: 50px;
        font-size: 16px;
        font-weight: 600;
        color: #7d7873;
        word-wrap: break-word;
        overflow:hidden;
    }

    /* smarthPhones */
    @media only screen and (max-width: 1024px) {        
        .ceo-words-container{  
            display: flex;
            flex-direction: column;                    
        }
        .ceo-words-container{
            align-items: center;
        }
        
        .ceo-words-photo{
            margin-left: 50px;
        }

        .ceo-words-info-container{ 
                  
            margin: 0px 50px 50px 50px;
        }
    }

    @media only screen and (max-width: 767px) { 
        .ceo-words-photo{
            transform:scale(0.8);
        }

        .ceo-words-info{
            transform:scale(0.8);
        }
        
    }
</style>

<section class="ceo-words">    
    <div class="ceo-words-container">
        <div class="ceo-words-photo">
            <img src="assets/placeholder-video.png" alt="Ceo Photo"> 
        </div>
        <div class="ceo-words-info">
            <div class="ceo-words-info-container">
                <div class="ceo-words-info-title">
                    <span>PALAVRA DO CEO</span>
                </div>
                <div class="ceo-words-info-subtitle">
                    <span><em>Carlos Curioni</em></span>
                </div>
                <div class="ceo-words-info-text">
                    <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.  </span>
                </div> 
            </div>               
        </div>
    </div>
</section>