# frozen_string_literal: true

require 'test_helper'

class PasswordResetsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(username: 'test', email: 'test@test.de', password: 'randompasswd')
  end

  test 'throws bad request if no email is provided in params' do
    post password_request_path, params: {
      email: nil
    }

    assert_response :bad_request
  end

  test 'throws not found if wrong email is provided in params' do
    post password_request_path, params: {
      email: 'invalid'
    }

    assert_response :not_found
  end

  test 'generates a token' do
    post password_request_path, params: {
      email: @user.email
    }

    assert_response :created
    assert JSON.parse(response.body)['password_reset_token']
  end
end
