# frozen_string_literal: true

require 'test_helper'

class MainPageMatchesTest < JavascriptIntegrationTest
  test 'shows main page with a match' do
    login_user_and_create_matches(2)

    assert_text 'test1'
  end

  test 'shows user matches with two other users' do
    login_user_and_create_matches(3)

    assert_text 'test1'
    assert_text 'test2'
  end

  private

  def login_user_and_create_matches(user_amount)
    stub_multiple_users(user_amount)

    UserMatchingJob.perform_now

    visit '/signin'

    find_field(id: 'login').click

    fill_in('username', with: 'test0')
    fill_in('password', with: 'passwd0')

    click_on 'Submit'

    assert_selector "a[href$='/main']", text: 'CoffeeRoulette'

    assert_no_text 'Welcome'
    assert_selector '.timeline'
  end
end
