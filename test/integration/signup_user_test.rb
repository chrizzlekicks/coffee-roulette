# frozen_string_literal: true

require 'test_helper'

class SignupUserTest < JavascriptIntegrationTest
  setup { ActionController::Base.allow_forgery_protection = true }

  test 'signup' do
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
end
