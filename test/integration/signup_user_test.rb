# frozen_string_literal: true

require 'test_helper'

class SignupUserTest < JavascriptIntegrationTest
  test 'signup happy path' do
    go_to_signin

    fill_in('username', with: 'johndoe')
    fill_in('email', with: 'johndoe@email.de')
    fill_in('password', with: 'password')
    fill_in('password_confirmation', with: 'password')


    assert_difference 'User.count', 1 do
      click_on 'Submit'

      assert_text 'The user johndoe was created successfully'
    end
  end

  test 'signup fails' do
    stub_multiple_users(1)

    go_to_signin

    fill_in('username', with: 'test0')
    fill_in('email', with: 'test0@test.de')
    fill_in('password', with: 'passwd0')
    fill_in('password_confirmation', with: 'passwd0')

    click_on 'Submit'

    assert_text 'Validation failed: Email has already been taken'
  end

  test 'login happy path' do
    stub_multiple_users(1)

    go_to_signin

    find_field(id: 'login').click

    fill_in('username', with: 'test0')
    fill_in('password', with: 'passwd0')

    click_on 'Submit'

    assert_text 'Welcome'
    assert_button 'Logout'

    assert_selector "a[href$='/main']", text: 'CoffeeRoulette'
  end

  test 'login fails due to incorrect user' do
    stub_multiple_users(1)

    go_to_signin

    find_field(id: 'login').click

    fill_in('username', with: 'test1')
    fill_in('password', with: 'passwd1')

    click_on 'Submit'

    assert_text 'Username or password seem to be wrong or non existent'
  end

  private

  def go_to_signin
    visit root_path

    click_on 'Get Started'

    assert_text 'Register now!'
  end
end
