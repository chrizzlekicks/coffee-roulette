# frozen_string_literal: true

ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'
require 'capybara/rails'
require 'capybara/minitest'

module ActiveSupport
  class TestCase
    include ActionMailer::TestHelper

    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    # fixtures :all

    # Add more helper methods to be used by all tests here...

    def stub_multiple_users(count)
      count.times { |i| User.create!(username: "test#{i}", email: "test#{i}@test.de", password: "passwd#{i}") }
    end
  end
end

module ActionDispatch
  class IntegrationTest
    def create_session_for(user)
      post '/login', params: { user: { username: user.username, password: user.password } }, as: :json
      assert_response :created
      assert_equal 'Session created', JSON.parse(response.body)['message']
    end

    def logout_session
      delete '/logout'
      assert_response :ok
      assert_equal 'Session closed', JSON.parse(response.body)['message']
    end
  end
end

class JavascriptIntegrationTest < ActionDispatch::IntegrationTest
  include Capybara::DSL
  include Capybara::Minitest::Assertions

  Capybara.current_driver = ENV['CI'] == 'true' ? :selenium_chrome_headless : :selenium_chrome

  setup do
    ActionController::Base.allow_forgery_protection = true
  end

  teardown do
    Capybara.reset_sessions!
    ActionController::Base.allow_forgery_protection = false
  end
end
