# frozen_string_literal: true

require 'test_helper'

class SignupUserTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(username: 'test', email: 'test@test.de', password: 'randompasswd', password_confirmation: 'randompasswd')
  end

  test 'signup happy path' do
    visit '/'
    click_on 'Get Started'
    assert_text 'Signup with us'

    fill_in('username', with: 'johndoe')
    fill_in('email', with: 'johndoe@email.de')
    fill_in('password', with: 'password')
    fill_in('password_confirmation', with: 'password')

    assert_difference 'User.count', 1 do
      click_on 'Submit'
    end
    assert_text 'The user johndoe was created successfully'
  end

  test 'signup sad path: user submits empty form' do
    visit '/'
    click_on 'Signin'
    assert_text 'Signup with us'

    click_on 'Submit'
    assert_text "Validation failed: Password can't be blank, Email can't be blank, Email Please provide valid email address, Username can't be blank"
  end

  test 'signup sad path: user tries to sign in with existing user data' do
    visit '/'
    click_on 'Get Started'

    fill_in('username', with: 'test')
    fill_in('email', with: 'test@test.de')
    fill_in('password', with: 'randompasswd')
    fill_in('password_confirmation', with: 'randompasswd')

    click_on 'Submit'
    assert_text 'Validation failed: Email has already been taken'
  end
end
