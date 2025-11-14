# frozen_string_literal: true

require 'test_helper'

class SignupUserTest < JavascriptIntegrationTest
  test 'signup happy path' do
    go_to_signin

    fill_in('username', with: 'johndoe')
    fill_in('email', with: 'johndoe@email.de')
    fill_in('password', with: 'StrongPassword123!')
    fill_in('password_confirmation', with: 'StrongPassword123!')


    assert_difference 'User.count', 1 do
      click_on 'Create Account'

      assert_text 'The user johndoe was created successfully'
    end
  end

  test 'signup fails' do
    stub_multiple_users(1)

    go_to_signin

    fill_in('username', with: 'test0')
    fill_in('email', with: 'test0@test.de')
    fill_in('password', with: 'ValidPassword0!')
    fill_in('password_confirmation', with: 'ValidPassword0!')

    click_on 'Create Account'

    assert_text 'Validation failed: Email has already been taken'
  end

  test 'login happy path' do
    stub_multiple_users(1)

    go_to_signin

    click_on 'Already have an account? Sign in'

    fill_in('username', with: 'test0')
    fill_in('password', with: 'ValidPassword0!')

    click_on 'Continue'

    assert_text 'Your Coffee Matches'
    assert_button 'Logout'

    assert_selector "a[href$='/main']", text: 'CoffeeRoulette'
  end

  test 'login fails due to incorrect user' do
    stub_multiple_users(1)

    go_to_signin

    click_on 'Already have an account? Sign in'

    fill_in('username', with: 'test1')
    fill_in('password', with: 'ValidPassword1!')

    click_on 'Continue'

    assert_text 'Username or password seem to be wrong or non existent'
  end

  test 'signup works with Enter key submission' do
    go_to_signin

    fill_in('username', with: 'enteruser')
    fill_in('email', with: 'enteruser@email.de')
    fill_in('password', with: 'StrongPassword123!')
    password_field = find_field('password_confirmation')
    password_field.fill_in(with: 'StrongPassword123!')

    assert_difference 'User.count', 1 do
      # Press Enter to submit the form
      password_field.send_keys(:return)

      assert_text 'The user enteruser was created successfully'
    end
  end

  test 'login works with Enter key submission' do
    stub_multiple_users(1)

    go_to_signin

    click_on 'Already have an account? Sign in'

    fill_in('username', with: 'test0')
    password_field = find_field('password')
    password_field.fill_in(with: 'ValidPassword0!')

    # Press Enter to submit the form
    password_field.send_keys(:return)

    assert_text 'Your Coffee Matches'
    assert_button 'Logout'

    assert_selector "a[href$='/main']", text: 'CoffeeRoulette'
  end

  test 'signup shows password validation errors' do
    go_to_signin

    fill_in('username', with: 'testuser')
    fill_in('email', with: 'test@test.de')

    password_field = find_field('password')

    # Test too short password
    password_field.fill_in(with: 'Short1!')
    find_field('email').click # Trigger blur by clicking away
    assert_text 'Password must be at least 12 characters long', wait: 2

    # Test missing uppercase
    password_field.fill_in(with: 'lowercase123!')
    find_field('email').click # Trigger blur
    assert_text 'Password must contain at least one uppercase letter', wait: 2

    # Test missing number
    password_field.fill_in(with: 'NoNumbersHere!')
    find_field('email').click # Trigger blur
    assert_text 'Password must contain at least one number', wait: 2

    # Test missing special character
    password_field.fill_in(with: 'NoSpecialChar123')
    find_field('email').click # Trigger blur
    assert_text 'Password must contain at least one special character', wait: 2

    # Test valid password - error should disappear
    password_field.fill_in(with: 'ValidPassword123!')
    find_field('email').click # Trigger blur
    assert_no_text 'Password must', wait: 2
  end

  private

  def go_to_signin
    visit root_path

    click_on 'Start Matching Today'

    # Page starts in login mode, switch to signup
    assert_text 'Sign In'
    click_on "Don't have an account? Sign up"
    assert_text 'Create Account'
  end
end
