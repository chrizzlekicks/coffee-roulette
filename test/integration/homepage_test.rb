# frozen_string_literal: true

require 'test_helper'

class HomepageTest < JavascriptIntegrationTest
  setup do
    UserMatch.destroy_all
    Match.destroy_all
    User.destroy_all
  end

  test 'displays homepage with all sections' do
    visit root_path

    # Hero section
    assert_text 'CoffeeRoulette'
    assert_text 'Connect with colleagues over coffee, one match at a time'
    assert_text 'Break down silos and build meaningful relationships'

    # CTA buttons in hero
    assert_link 'Start Matching Today'
    assert_link 'How It Works'

    # Features section
    assert_text 'Why CoffeeRoulette?'
    assert_text 'Smart Matching'
    assert_text 'Daily Opportunities'
    assert_text 'Effortless Setup'

    # How It Works section
    assert_text 'How It Works'
    assert_text 'Sign Up'
    assert_text 'Get Matched'
    assert_text 'Connect & Chat'

    # Benefits section
    assert_text 'Transform Your Workplace'
    assert_text '+47%'
    assert_text '+32%'
    assert_text '150+'

    # Final CTA section
    assert_text 'Ready to Start Connecting?'
    assert_link 'Get Started Free'
    assert_link 'Sign In'
  end

  test 'hero CTA redirects to signin when not logged in' do
    visit root_path

    click_link 'Start Matching Today'

    assert_current_path '/signin'
    assert_text 'Register now!'
  end

  test 'final CTA redirects to signin when not logged in' do
    visit root_path

    # Scroll to bottom to make sure CTA is visible
    page.execute_script('window.scrollTo(0, document.body.scrollHeight)')
    
    click_link 'Get Started Free'

    assert_current_path '/signin'
    assert_text 'Register now!'
  end

  test 'How It Works anchor link scrolls to section' do
    visit root_path

    click_link 'How It Works'

    # Check that we're still on the homepage
    assert_current_path '/'
    
    # Check that the How It Works section is visible
    assert_text 'Getting started is simple and takes less than 2 minutes'
  end

  test 'displays correct content for each feature card' do
    visit root_path

    # Smart Matching card
    within('.card', text: 'Smart Matching') do
      assert_text '🎲'
      assert_text 'Our algorithm intelligently pairs you'
    end

    # Daily Opportunities card
    within('.card', text: 'Daily Opportunities') do
      assert_text '☕'
      assert_text 'Get matched regularly for coffee chats'
    end

    # Effortless Setup card
    within('.card', text: 'Effortless Setup') do
      assert_text '📧'
      assert_text 'Simple signup, instant email notifications'
    end
  end

  test 'displays testimonial chat bubbles' do
    visit root_path

    assert_text 'CoffeeRoulette helped me connect with people'
    assert_text 'I was skeptical at first, but now I look forward'
  end

  test 'shows appropriate buttons when user is authenticated' do
    stub_multiple_users(1)

    visit '/signin'
    find_field(id: 'login').click
    fill_in('username', with: 'test0')
    fill_in('password', with: 'passwd0')
    click_on 'Submit'

    # Navigate back to homepage
    visit root_path

    # Check that CTAs now point to /main
    hero_cta = find('a.btn-primary', text: 'Start Matching Today')
    assert hero_cta[:href].end_with?('/main')

    # Scroll to final CTA section
    page.execute_script('window.scrollTo(0, document.body.scrollHeight)')
    
    final_cta = find('a.btn-white', text: 'Get Started Free')
    assert final_cta[:href].end_with?('/main')

    secondary_cta = find('a.btn-outline', text: 'Go to Dashboard')
    assert secondary_cta[:href].end_with?('/main')
  end

  test 'hero section has gradient text styling' do
    visit root_path

    hero_title = find('h1', text: 'CoffeeRoulette')
    assert hero_title[:class].include?('bg-gradient-to-r')
    assert hero_title[:class].include?('from-primary')
    assert hero_title[:class].include?('to-accent')
    assert hero_title[:class].include?('bg-clip-text')
  end

  test 'all sections have proper spacing and layout classes' do
    visit root_path

    # Check hero section
    hero_section = find('section.hero')
    assert hero_section[:class].include?('py-20')

    # Check features section
    features_section = find('section', text: 'Why CoffeeRoulette?')
    assert features_section[:class].include?('py-20')

    # Check how it works section
    how_it_works_section = find('section#how-it-works')
    assert how_it_works_section[:class].include?('py-20')
  end

  test 'numbered steps in How It Works section' do
    visit root_path

    # Check for numbered circles
    within('#how-it-works') do
      assert_text '1'
      assert_text '2' 
      assert_text '3'

      # Check step content
      assert_text 'Create your account with just your email and name'
      assert_text 'Our algorithm pairs you with colleagues'
      assert_text 'Meet up for coffee, tea, or a quick chat'
    end
  end

  test 'statistics display proper formatting' do
    visit root_path

    # Team Collaboration stat
    within('.stat', text: 'Team Collaboration') do
      assert_text '+47%'
      assert_text 'Increase in cross-team projects'
    end

    # Employee Satisfaction stat
    within('.stat', text: 'Employee Satisfaction') do
      assert_text '+32%'
      assert_text 'Higher workplace happiness scores'
    end

    # New Connections stat
    within('.stat', text: 'New Connections') do
      assert_text '150+'
      assert_text 'Relationships formed monthly'
    end
  end

  test 'homepage is mobile responsive' do
    # Test mobile viewport
    page.driver.browser.manage.window.resize_to(375, 667)
    
    visit root_path

    # Check that content is still visible and properly laid out
    assert_text 'CoffeeRoulette'
    assert_text 'Connect with colleagues'
    assert_link 'Start Matching Today'
    
    # Check that features are stacked vertically on mobile
    features = all('.card', text: /Smart Matching|Daily Opportunities|Effortless Setup/)
    assert_equal 3, features.count
  end

  test 'final CTA section has gradient background' do
    visit root_path

    final_cta_section = find('section', text: 'Ready to Start Connecting?')
    assert final_cta_section[:class].include?('bg-gradient-to-r')
    assert final_cta_section[:class].include?('from-primary')
    assert final_cta_section[:class].include?('to-accent')
  end

  test 'hover effects work on feature cards' do
    visit root_path

    feature_card = find('.card', text: 'Smart Matching')
    assert feature_card[:class].include?('hover:shadow-xl')
    assert feature_card[:class].include?('transition-shadow')
  end
end