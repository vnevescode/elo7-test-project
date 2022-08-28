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
        border: 1px solid;
    }
</style>


<section class="company-photo-section">
    <div class="company-photo-container">
        <img src="{companyPhoto.src}" alt="Company Bottom Photo">
    </div>
</section>