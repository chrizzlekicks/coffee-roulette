# frozen_string_literal: true

require 'minitest/autorun'

class PasswordResetsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(username: 'test', email: 'test@test.de', password: 'randompasswd')
  end

  test 'foo' do
    post password_reset_path, params: {
      email: @user.email
    }

    assert_response :created
  end
end
