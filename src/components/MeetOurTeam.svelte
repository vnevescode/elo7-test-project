<script>
    export let members;
    export let membersNames;
    $: innerWidth = 0;
</script>

<svelte:window bind:innerWidth />

<style>
    .meet-our-team{
       /*  background-color: #f8f8f8; */
       background-color: #f8f8f8;
       font-family: 'Roboto';
       display: flex;
       justify-content: center;
       color:#7d7873;
        
    }

    .meet-our-team-container{
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align:center;
        /* border: 1px solid black; */
    }

    .meet-our-team-container-members{             
        padding: 50px;
        display: flex;
        flex-direction: row;
        gap: 10px;
        justify-content: center;
    }
    
    .meet-our-team-container-members-smartphone{
        padding: 50px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        
    }

    .member-container-info{
        display: flex;
        flex-direction: row;
        gap: 10px;
    }
    .member-info{
        height: 200px;
        width: 200px;
        
        align-items: center;
        justify-content: center;
        display: flex;
        flex-direction: column;
    }  

    /* smartphone */
    @media screen and (max-width: 767px) {
        .member-image{
            transform:scale(0.8);
        }
    }

</style>

<section class="meet-our-team">
    <div class="meet-our-team-container">
        <div class="meet-our-team-container-title">
            <h1>CONHEÇA NOSSO TIME</h1>
            <h1>FORA DE SÉRIE</h1>            
        </div>
        {#if innerWidth < 767}            
            <div class="meet-our-team-container-members-smartphone">
                {#each members as member, index}
                    <div class="member-container-info">
                        <div class="member-image">
                            <img src={member.src} alt="Team Member" index={index} />
                        </div>
                        <div class="member-info">
                            <span 
                                style="color: #7d7873; 
                                font-weight: 600; 
                                font-size: 18px;"
                            >{membersNames[index]}</span>
                            <span
                                style="color: #7d7873; 
                                font-size: 16px;"
                            > </span>                            
                        </div>
                    </div>                                    
                {/each} 
            </div>
        {:else}
            <div class="meet-our-team-container-members">
                {#each members as member, index}                
                    <img src={member.src} alt="Team Member" index={index} />
                {/each} 
            </div>
        {/if} 
    </div>
</section>
