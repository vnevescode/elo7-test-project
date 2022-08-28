<script>
    export let members;
</script>

<style>
    .meet-our-team{
       /*  background-color: #f8f8f8; */
       background-color: #f8f8f8;
       font-family: 'Roboto';
       display: flex;
       justify-content: center;
        
    }

    .meet-our-team-container{
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align:center;
        border: 1px solid black;
    }

    .meet-our-team-container-members{             
        padding: 50px;
        display: flex;
        flex-direction: row;
        gap: 10px;
        justify-content: center;
    }
</style>

<section class="meet-our-team">
    <div class="meet-our-team-container">
        <div class="meet-our-team-container-title">
            <h1>CONHEÇA NOSSO TIME</h1>
            <h1>FORA DE SÉRIE</h1>
        </div>
        <div class="meet-our-team-container-members">
            {#each members as member, index}                
                <img src={member.src} alt="Team Member" index={index} />
            {/each}   
        </div>
    </div>
</section>
