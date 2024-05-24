# frozen_string_literal: true

require 'test_helper'

class PasswordResetsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(username: 'test', email: 'test@test.de', password: 'randompasswd')
  end

  test 'throws bad request if no email is provided in params' do
    post password_reset_path, params: {
      email: nil
    }

    assert_response :bad_request
  end

  test 'throws not found if wrong email is provided in params' do
    post password_reset_path, params: {
      email: 'invalid'
    }

    assert_response :not_found
  end

  test 'sends one email to user when password reset is triggered and returns 201 status code' do
    assert_emails 1 do
      post password_reset_path, params: {
        email: @user.email
      }

      assert_response :created
    end
  end

  test 'URL with token is sent by email' do
    emails = capture_emails do
      post password_reset_path, params: {
        email: @user.email
      }
    end

    assert_includes emails.first.html_part.body.to_s, 'https://coffeeroulette.com/password/reset?token='
  end

  test 'updates password of the user with new password and token' do
    token = @user.generate_token_for(:password_reset)

    assert_changes -> { @user.reload.password_digest } do
      put password_reset_path, params: {
        token: token,
        password_digest: 'whatever'
      }

      assert_response :ok
    end
  end

  # test 'wrong token provided'
  # test 'no token provided'
  # test 'expired token provided'
  # test 'bad request: password wrong format'
  # test 'session cleared'
end
