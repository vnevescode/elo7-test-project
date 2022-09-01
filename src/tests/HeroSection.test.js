import HeroSection from '../components/HeroSection.svelte';
import { render, screen } from '@testing-library/svelte';
 

test('Should has a title in the component', ()=>{
    render(HeroSection);
    
})