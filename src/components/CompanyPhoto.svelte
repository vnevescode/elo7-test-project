<script>
    export let companyPhoto;
</script>

<style>
    .company-photo-section{
        font-family: 'Roboto';
        display: flex;
        justify-content: center;
    }

    .company-photo-container{
        display: flex;
        flex-direction: row;
        justify-content: center;        
        width: 960px;
        margin-top: 30px;
        /* border: 1px solid; */
    }

    @media screen and (max-width: 1024px) {
        
        .company-photo-container{
            transform:scale(0.8);
        }
    }

    /* smartphone */
    @media screen and (max-width: 767px) {
        .company-photo-container > img{
            transform:scale(0.8);
        }
    }
</style>


<section class="company-photo-section">
    <div class="company-photo-container">
        <img src="{companyPhoto.src}" alt="Company Bottom Photo">
    </div>
</section>